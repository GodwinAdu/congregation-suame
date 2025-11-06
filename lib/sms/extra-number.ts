    /**
   * Extracts and normalizes the *most likely valid* Ghanaian phone number
   * from arbitrary user input. Returns "233XXXXXXXXX" (no "+") or null if none.
   *
   * ✅ Features:
   * - Accepts: 0XXXXXXXXX, XXXXXXXXX, 233XXXXXXXXX, +233XXXXXXXXX
   * - Handles messy inputs with text, spaces, punctuation, or multiple numbers.
   * - Rejects junk (000000000, 111111111, 123456789, repeating patterns, etc.).
   * - Uses Ghana mobile prefix whitelist for higher accuracy.
   * - Scores multiple matches to pick the most plausible one.
   */
    export function extractBestGhanaNumber(input: string): string | null {
        if (!input || typeof input !== "string") return null;

        // Extract digit sequences (potential phone numbers)
        const candidates = input.match(/\d{7,15}/g);
        if (!candidates) return null;

        // Ghana mobile number prefixes (local format)
        const validPrefixes = [
            "020", "023", "024", "025", "026", "027", "028", "029",
            "050", "053", "054", "055", "056", "057", "058", "059"
        ];

        // Utility checks
        const allSame = (s: string) => /^([0-9])\1*$/.test(s);
        const uniqueCount = (s: string) => new Set(s).size;
        const isSequentialInc = (s: string) =>
            [...s].every((ch, i, arr) => i === 0 || Number(ch) === Number(arr[i - 1]) + 1);
        const isSequentialDec = (s: string) =>
            [...s].every((ch, i, arr) => i === 0 || Number(ch) === Number(arr[i - 1]) - 1);

        // Try to normalize any digit sequence into a valid Ghana number
        const normalize = (num: string): string | null => {
            let n = num.replace(/\D/g, "");
            if (!n) return null;

            if (n.startsWith("233") && n.length === 12) {
                // Already in E.164 format
            } else if (n.startsWith("0") && n.length === 10) {
                n = "233" + n.slice(1);
            } else if (n.length === 9) {
                n = "233" + n;
            } else {
                return null;
            }

            if (!/^233\d{9}$/.test(n)) return null;

            const subscriber = n.slice(3);
            const localPrefix = "0" + subscriber.slice(0, 2);

            // Validate prefix
            const prefixMatch = validPrefixes.some((p) =>
                ("0" + subscriber).startsWith(p)
            );

            // Reject patterns that are obviously invalid
            if (!prefixMatch) return null;
            if (allSame(subscriber)) return null;
            if (uniqueCount(subscriber) < 3) return null;
            if (isSequentialInc(subscriber) || isSequentialDec(subscriber)) return null;

            // Reject simple repeating patterns (e.g., 121212121)
            for (let len = 1; len <= 3; len++) {
                const pattern = subscriber.slice(0, len);
                if (pattern.repeat(Math.ceil(9 / len)).slice(0, 9) === subscriber) return null;
            }

            return n;
        };

        // Assign a likelihood score to each candidate number
        const scoreCandidate = (num: string): number => {
            let score = 0;
            if (num.startsWith("0")) score += 2; // local style preferred
            if (num.startsWith("233")) score += 1; // valid E.164 style
            if (num.length === 10 || num.length === 12) score += 2; // proper length
            if (/\D/.test(num)) score -= 1; // penalize weird formatting
            return score;
        };

        const validCandidates = candidates
            .map((raw) => {
                const formatted = normalize(raw);
                return formatted ? { raw, formatted, score: scoreCandidate(raw) } : null;
            })
            .filter(Boolean) as { raw: string; formatted: string; score: number }[];

        if (validCandidates.length === 0) return null;

        // Sort by score descending, then by order in input (stable)
        validCandidates.sort((a, b) => b.score - a.score);

        return validCandidates[0]?.formatted || null;
    }
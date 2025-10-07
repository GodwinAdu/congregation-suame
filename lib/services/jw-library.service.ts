interface JWLibraryItem {
    title: string;
    duration?: number;
    source?: string;
    type: "Bible Reading" | "Apply Yourself" | "Living as Christians" | "Watchtower Study" | "Public Talk" | "Bible Study";
}

interface JWLibraryWeek {
    weekOf: string;
    midweekMeeting: JWLibraryItem[];
    weekendMeeting: JWLibraryItem[];
}

export class JWLibraryService {
    private static readonly BASE_URL = "https://www.jw.org/en/library/jw-meeting-workbook";

    static async fetchWeeklyProgram(weekDate: string): Promise<JWLibraryWeek> {
        const meetingUrl = this.getMeetingWorkbookUrl(weekDate);
        console.log('Fetching real data from:', meetingUrl);
        
        try {
            // Try multiple CORS proxies
            const proxies = [
                `https://api.allorigins.win/get?url=${encodeURIComponent(meetingUrl)}`,
                `https://corsproxy.io/?${encodeURIComponent(meetingUrl)}`,
                `https://cors-anywhere.herokuapp.com/${meetingUrl}`
            ];
            
            for (const proxyUrl of proxies) {
                try {
                    console.log('Trying proxy:', proxyUrl);
                    const response = await fetch(proxyUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    
                    if (!response.ok) {
                        console.log(`Proxy failed with status: ${response.status}`);
                        continue;
                    }
                    
                    const text = await response.text();
                    console.log('Response preview:', text.substring(0, 100));
                    
                    let html;
                    
                    // Handle different proxy response formats
                    if (proxyUrl.includes('allorigins')) {
                        try {
                            const data = JSON.parse(text);
                            html = data.contents;
                        } catch (e) {
                            console.log('Failed to parse allorigins response as JSON');
                            continue;
                        }
                    } else {
                        html = text;
                    }
                    
                    if (html && html.length > 1000) {
                        console.log('Successfully fetched HTML, length:', html.length);
                        return this.parseJWMeetingWorkbook(html, weekDate);
                    }
                } catch (proxyError) {
                    console.log('Proxy error:', proxyError.message);
                    continue;
                }
            }
            
            throw new Error('All proxies failed');
            
        } catch (error) {
            console.error('Error fetching JW Library data:', error);
            // Return empty structure instead of fallback
            return {
                weekOf: weekDate,
                midweekMeeting: [],
                weekendMeeting: []
            };
        }
    }

    private static getMeetingWorkbookUrl(weekDate: string): string {
        const date = new Date(weekDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Use specific week URL format
        return `${this.BASE_URL}/${year}/${month}/${day}`;
    }

    private static parseJWMeetingWorkbook(html: string, weekDate: string): JWLibraryWeek {
        console.log('Parsing HTML for meeting data...');
        
        const midweekMeeting: JWLibraryItem[] = [];
        const weekendMeeting: JWLibraryItem[] = [];
        
        // More comprehensive regex patterns for JW.org content
        const patterns = {
            bibleReading: /<h3[^>]*>\s*Bible Reading\s*<\/h3>[\s\S]*?<p[^>]*>([^<]+)<\/p>[\s\S]*?\((\d+)\s*min/i,
            treasuresTitle: /<h2[^>]*>\s*TREASURES FROM GOD'S WORD\s*<\/h2>/i,
            applyYourselfTitle: /<h2[^>]*>\s*APPLY YOURSELF TO THE FIELD MINISTRY\s*<\/h2>/i,
            livingTitle: /<h2[^>]*>\s*LIVING AS CHRISTIANS\s*<\/h2>/i,
            assignments: /<div[^>]*class="[^"]*pGroup[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
            duration: /\((\d+)\s*min\)/i,
            publicTalk: /<h3[^>]*>\s*Public Talk\s*<\/h3>[\s\S]*?<p[^>]*>([^<]+)<\/p>/i,
            watchtowerStudy: /<h3[^>]*>\s*Watchtower Study\s*<\/h3>[\s\S]*?<p[^>]*>([^<]+)<\/p>/i
        };
        
        // Extract Bible Reading
        const bibleReadingMatch = html.match(patterns.bibleReading);
        if (bibleReadingMatch) {
            midweekMeeting.push({
                title: "Bible Reading",
                source: this.cleanText(bibleReadingMatch[1]),
                duration: parseInt(bibleReadingMatch[2]),
                type: "Bible Reading"
            });
            console.log('Found Bible Reading:', bibleReadingMatch[1]);
        }
        
        // Extract all assignment blocks
        let assignmentMatch;
        while ((assignmentMatch = patterns.assignments.exec(html)) !== null) {
            const content = assignmentMatch[1];
            const durationMatch = content.match(patterns.duration);
            const duration = durationMatch ? parseInt(durationMatch[1]) : 0;
            
            // Clean and extract title
            const cleanContent = this.cleanText(content);
            
            if (cleanContent && duration > 0) {
                // Determine assignment type based on content
                if (cleanContent.toLowerCase().includes('initial call') || 
                    cleanContent.toLowerCase().includes('return visit') ||
                    cleanContent.toLowerCase().includes('bible study')) {
                    midweekMeeting.push({
                        title: cleanContent.replace(/\(\d+\s*min\)/i, '').trim(),
                        duration: duration,
                        type: "Apply Yourself"
                    });
                } else if (cleanContent.toLowerCase().includes('local needs') ||
                          cleanContent.toLowerCase().includes('song') ||
                          cleanContent.toLowerCase().includes('prayer')) {
                    midweekMeeting.push({
                        title: cleanContent.replace(/\(\d+\s*min\)/i, '').trim(),
                        duration: duration,
                        type: "Living as Christians"
                    });
                } else if (cleanContent.toLowerCase().includes('congregation bible study')) {
                    midweekMeeting.push({
                        title: "Congregation Bible Study",
                        source: cleanContent.replace(/\(\d+\s*min\)/i, '').replace(/congregation bible study[:\s]*/i, '').trim(),
                        duration: duration,
                        type: "Bible Study"
                    });
                }
            }
        }
        
        // Extract Public Talk
        const publicTalkMatch = html.match(patterns.publicTalk);
        if (publicTalkMatch) {
            weekendMeeting.push({
                title: this.cleanText(publicTalkMatch[1]),
                duration: 30,
                type: "Public Talk"
            });
            console.log('Found Public Talk:', publicTalkMatch[1]);
        }
        
        // Extract Watchtower Study
        const watchtowerMatch = html.match(patterns.watchtowerStudy);
        if (watchtowerMatch) {
            weekendMeeting.push({
                title: "Watchtower Study",
                source: this.cleanText(watchtowerMatch[1]),
                duration: 60,
                type: "Watchtower Study"
            });
            console.log('Found Watchtower Study:', watchtowerMatch[1]);
        }
        
        console.log('Parsed assignments:', { midweek: midweekMeeting.length, weekend: weekendMeeting.length });
        
        return {
            weekOf: weekDate,
            midweekMeeting,
            weekendMeeting
        };
    }
    
    private static cleanText(text: string): string {
        return text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            .replace(/&amp;/g, '&') // Replace &amp; with &
            .replace(/&lt;/g, '<') // Replace &lt; with <
            .replace(/&gt;/g, '>') // Replace &gt; with >
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
    }







    static mapToAssignmentType(jwType: JWLibraryItem["type"]): "Watchtower Reader" | "Bible Student Reader" | "Life and Ministry" {
        switch (jwType) {
            case "Watchtower Study":
                return "Watchtower Reader";
            case "Bible Study":
                return "Bible Student Reader";
            case "Bible Reading":
            case "Apply Yourself":
            case "Living as Christians":
            case "Public Talk":
                return "Life and Ministry";
            default:
                return "Life and Ministry";
        }
    }

    static mapToMeetingType(jwType: JWLibraryItem["type"]): "Midweek" | "Weekend" {
        switch (jwType) {
            case "Watchtower Study":
            case "Public Talk":
                return "Weekend";
            default:
                return "Midweek";
        }
    }
}
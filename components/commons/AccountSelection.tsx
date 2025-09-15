
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ClassSelectionProps {
    accounts: IAccount[],
    selectedAccount: (value: string) => void;
}
const AccountSelection = ({ selectedAccount, accounts }: ClassSelectionProps) => {

    return (
        <>
            <Select
                onValueChange={(value) => selectedAccount(value)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={accounts[0]?.accountName} />
                </SelectTrigger>
                <SelectContent>
                    {accounts?.map((account) => (
                        <SelectItem key={account._id} value={account._id ?? ""}>
                            {account.accountName}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>


        </>
    )
}

export default AccountSelection

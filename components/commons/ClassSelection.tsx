
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ClassSelectionProps {
    classes: IClass[],
    selectedClass: (value: string) => void;
}
const ClassSelection = ({ selectedClass, classes }: ClassSelectionProps) => {

    return (
        <>
            <Select
                onValueChange={(value) => selectedClass(value)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={classes[0]?.name}/>
                </SelectTrigger>
                <SelectContent>
                    {classes?.map((cls) => (
                        <SelectItem key={cls._id} value={cls._id || ''}>
                            {cls.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>


        </>
    )
}

export default ClassSelection

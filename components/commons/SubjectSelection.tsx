
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface SubjectSelectionProps {
    subjects: ISubject[],
    selectedSubject: (value: string) => void;
}
const SubjectSelection = ({ selectedSubject, subjects }: SubjectSelectionProps) => {

    return (
        <>
            <Select
                onValueChange={(value) => selectedSubject(value)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={subjects[0]?.subjectName}/>
                </SelectTrigger>
                <SelectContent>
                    {subjects?.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id || ''}>
                            {subject.subjectName}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>


        </>
    )
}

export default SubjectSelection
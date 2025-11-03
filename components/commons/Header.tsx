
interface HeadingProps {
  title: string;
  description?: string;
}

const Heading: React.FC<HeadingProps> = ({
  title,
  description
}) => {
  return (
    <div className="px-1 sm:px-2 py-1 sm:py-2">
      <h2 className="text-xl sm:text-3xl font-bold tracking-tight pb-1 sm:pb-2">{title}</h2>
      <p className='text-xs sm:text-sm text-muted-foreground'>{description}</p>
    </div>
  )
}

export default Heading

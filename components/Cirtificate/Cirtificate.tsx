export default function Certificate({
  title,
  icon,
  color,
  description,
  organization,
  date,
  tags,
  certificateLink,
}: {
  title: string
  icon: string
  color: string
  description: string
  organization: string
  date: string
  tags: string
  certificateLink: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition duration-300">
      <div className={`bg-${color}-600 p-5 flex items-center justify-between`}>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <div className="bg-white text-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
          <i className={icon}></i>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-700 font-medium mb-4">{description}</p>
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <i className="fas fa-building mr-2 w-5 text-blue-500"></i>
            <span>{organization}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <i className="far fa-calendar-alt mr-2 w-5 text-blue-500"></i>
            <span>{date}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <i className="fas fa-tag mr-2 w-5 text-blue-500"></i>
            <span>{tags}</span>
          </div>
        </div>
        {certificateLink && certificateLink !== '#' && (
          <a
            href={certificateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
          >
            <span>View Certificate</span>
            <i className="fas fa-external-link-alt ml-1"></i>
          </a>
        )}
      </div>
    </div>
  )
}


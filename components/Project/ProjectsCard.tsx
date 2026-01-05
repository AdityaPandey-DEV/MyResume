function TechnologyBadge({ tech }: { tech: string }) {
  return (
    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
      {tech}
    </span>
  )
}

export default function ProjectsCard({
  name,
  description,
  technologies,
  icon,
  gradient,
  githubLink,
  liveDemoLink,
}: {
  name: string
  description: string
  technologies: string[]
  icon?: string
  gradient?: string
  githubLink?: string
  liveDemoLink?: string
}) {
  return (
    <div className="project-card bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 animate-fade-in">
      <div
        className={`h-48 bg-gradient-to-r ${gradient || 'from-blue-400 to-indigo-500'} p-6 flex items-center justify-center relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-blue-500 opacity-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full text-white opacity-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
        </div>
        {icon && <i className={`${icon} text-white text-5xl z-10`}></i>}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-800">{name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {technologies.map((tech, index) => (
            <TechnologyBadge key={index} tech={tech} />
          ))}
        </div>

        <div className="flex justify-between">
          {githubLink && (
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <i className="fab fa-github mr-2"></i>
              <span>View Code</span>
            </a>
          )}
          {liveDemoLink && (
            <a
              href={liveDemoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              <span>Live Demo</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}


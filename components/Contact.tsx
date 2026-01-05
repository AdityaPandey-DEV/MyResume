export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Let&apos;s Connect
        </h2>
        <p className="text-lg text-center mb-12 max-w-3xl mx-auto">
          I&apos;m always open to new opportunities, collaborations, or just a
          friendly chat about technology and coding.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16 animate-fade-in">
          <div className="glassmorphism rounded-xl p-6 text-center hover:bg-opacity-20 transition duration-300">
            <div className="bg-white text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-envelope text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Email Me</h3>
            <p className="mb-4">Feel free to reach out via email</p>
            <a
              href="mailto:adityapandey.dev.in@gmail.com"
              className="text-white hover:text-yellow-200 transition duration-300 font-medium"
            >
              adityapandey.dev.in@gmail.com
            </a>
          </div>

          <div className="glassmorphism rounded-xl p-6 text-center hover:bg-opacity-20 transition duration-300">
            <div className="bg-white text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fab fa-linkedin-in text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">LinkedIn</h3>
            <p className="mb-4">Connect with me professionally</p>
            <a
              href="https://www.linkedin.com/in/adityapandey-dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-200 transition duration-300 font-medium"
            >
              adityapandey-dev
            </a>
          </div>

          <div className="glassmorphism rounded-xl p-6 text-center hover:bg-opacity-20 transition duration-300">
            <div className="bg-white text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fab fa-github text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">GitHub</h3>
            <p className="mb-4">Check out my code and projects</p>
            <a
              href="https://github.com/adityapandey-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-200 transition duration-300 font-medium"
            >
              adityapandey-dev
            </a>
          </div>
        </div>

        <div className="max-w-2xl mx-auto glassmorphism rounded-xl p-8 animate-fade-in delay-200">
          <h3 className="text-2xl font-bold mb-6 text-center">Send Me a Message</h3>

          <form
            action="https://formspree.io/f/xanezeqo"
            method="POST"
            id="contact-form"
            className="space-y-6"
          >
            <input type="hidden" name="_captcha" value="false" />
            <input
              type="hidden"
              name="_next"
              value="https://adityapandey-dev.github.io/thank-you.html"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-white placeholder-white placeholder-opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  required
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-white placeholder-white placeholder-opacity-60"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Project Collaboration"
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-white placeholder-white placeholder-opacity-60"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Your message here..."
                required
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-white placeholder-white placeholder-opacity-60"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-blue-600 hover:bg-opacity-90 font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
            >
              <i className="fas fa-paper-plane mr-2"></i>
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}


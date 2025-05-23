import { motion } from 'framer-motion';
import { FaLinkedin, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const footerLinks = [
    {
      title: "Quick Links",
      links: [
        { name: "Home", href: "/" },
        { name: "Tests", href: "/tests" },
      ],
    },
    {
      title: "Subjects",
      links: [
        { name: "Aptitude", href: "/aptitude" },
        { name: "Logical Reasoning", href: "/logical-reasoning" },
        { name: "Verbal Ability", href: "/verbal-ability" },
        { name: "Programming", href: "/programming" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Contact Us", href: "/#" },
        { name: "FAQs", href: "/#" },
        { name: "Privacy Policy", href: "/#" },
        { name: "Terms of Service", href: "/#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FaLinkedin size={20} />, name: "LinkedIn", href: "#" },
    { icon: <FaTwitter size={20} />, name: "Twitter", href: "#" },
    { icon: <FaInstagram size={20} />, name: "Instagram", href: "#" },
    { icon: <FaYoutube size={20} />, name: "YouTube", href: "#" },
  ];


  return (
    <footer className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
        >
          {/* Brand Column */}
          <div>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="flex items-center mb-4"
            >
              <span className="flex justify-center items-center font-[Caveat] text-3xl font-bold text-white">
                <img src="https://res.cloudinary.com/djhweskrq/image/upload/v1747983145/ExamaniaHub_logo_.0_1_a0j9ql.png" width={65} alt="logo" />
                               <span className='font-bold font-serif flex'>Examania <h3 className='text-amber-300'>Hub</h3> </span>

              </span>
            </motion.div>
            <p className="text-white/80 mb-6">
              Your ultimate exam preparation platform with cutting-edge tools and personalized learning paths.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white hover:text-blue-200 transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((column, index) => (
            <div key={index}>
              <motion.h3 
                whileHover={{ x: 5 }}
                className="text-xl font-bold mb-4 text-white"
              >
                {column.title}
              </motion.h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <motion.li 
                    key={linkIndex}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <a 
                      href={link.href} 
                      className="text-white/80 hover:text-white hover:underline transition-colors"
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}

        </motion.div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-blue-700/50 py-4">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} AbyaasZone. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/#" className="text-white/60 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="/#" className="text-white/60 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="/#" className="text-white/60 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
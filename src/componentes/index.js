"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

const carouselImages = [
  "https://th.bing.com/th?id=OIP.TuC7alPpv5z5v8sw1Db_4QHaHa&w=250&h=250&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
  "https://th.bing.com/th?id=OIP.TuC7alPpv5z5v8sw1Db_4QHaHa&w=250&h=250&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
  "https://th.bing.com/th?id=OIP.TuC7alPpv5z5v8sw1Db_4QHaHa&w=250&h=250&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2"
]

const infoCards = [
  { title: "Programas Educativos", description: "Brindamos apoyo a estudiantes de todo el mundo con programas diseñados para garantizar el acceso a la educación.", image: "https://th.bing.com/th?id=OIP.TuC7alPpv5z5v8sw1Db_4QHaHa&w=250&h=250&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2" },
  { title: "Lucha contra la Desigualdad", description: "Nuestras iniciativas se centran en reducir la desigualdad en comunidades vulnerables a través de la educación y el empoderamiento.", image: "https://th.bing.com/th?id=OIP.TuC7alPpv5z5v8sw1Db_4QHaHa&w=250&h=250&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2" },
  { title: "Apoyo Integral", description: "Ofrecemos ayudas integrales a personas y familias en situación de riesgo social para mejorar su calidad de vida.", image: "https://th.bing.com/th?id=OIP.TuC7alPpv5z5v8sw1Db_4QHaHa&w=250&h=250&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2" }
]

const testimonials = [
  { name: "Juan Pérez", comment: "Gracias a Solvia, pude continuar con mis estudios y mejorar mi futuro.", image: "https://th.bing.com/th?id=OIP.TuC7alPpv5z5v8sw1Db_4QHaHa&w=250&h=250&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2" },
  { name: "Ana López", comment: "El programa de igualdad de Solvia transformó mi comunidad. Hoy tenemos más oportunidades que antes.", image: "https://th.bing.com/th?id=OIP.TuC7alPpv5z5v8sw1Db_4QHaHa&w=250&h=250&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2" },
  { name: "Carlos Martínez", comment: "El apoyo que recibí de Solvia me permitió cumplir mi sueño de terminar la universidad.", image: "https://th.bing.com/th?id=OIP.TuC7alPpv5z5v8sw1Db_4QHaHa&w=250&h=250&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2" }
]

export default function LandingPage() {
  const [currentImage, setCurrentImage] = useState(0)
  const controls = useAnimation()
  const containerRef = useRef(null)

  // Evitamos la ejecución doble en modo estricto con una bandera
  useEffect(() => {
    let isMounted = true

    const imageTimer = setInterval(() => {
      if (isMounted) {
        setCurrentImage((prev) => (prev + 1) % carouselImages.length)
      }
    }, 5000)

    return () => {
      isMounted = false
      clearInterval(imageTimer)
    }
  }, [])

  // Animación del carrusel con Framer Motion
  useEffect(() => {
    let isMounted = true

    const animateCarousel = async () => {
      if (isMounted) {
        await controls.start({ x: `-${100 / 3}%`, transition: { duration: 10, ease: 'linear' } })
        controls.set({ x: '0%' })
        animateCarousel()
      }
    }

    if (isMounted) {
      animateCarousel()  // Solo se anima si está montado
    }

    return () => {
      isMounted = false
    }
  }, [controls])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Logo
          </motion.h1>
          <ul className="flex space-x-4">
            <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <a href="/" className="hover:text-purple-400">Home</a>
            </motion.li>
            <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <a href="/login" className="hover:text-purple-400">Iniciar sesión</a>
            </motion.li>
            <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <a href="/register" className="hover:text-purple-400">Registrate</a>
            </motion.li>
          </ul>
        </nav>
      </header>

      {/* Carousel */}
      <section className="relative h-96 overflow-hidden">
        <motion.img
          key={currentImage}
          src={carouselImages[currentImage]}
          alt={`Slide ${currentImage + 1}`}
          className="absolute w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
        <button 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full"
          onClick={() => setCurrentImage((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
        >
          <ChevronLeft className="text-white" />
        </button>
        <button 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full"
          onClick={() => setCurrentImage((prev) => (prev + 1) % carouselImages.length)}
        >
          <ChevronRight className="text-white" />
        </button>
      </section>

      {/* Info Cards */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Nuestros Programas
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {infoCards.map((card, index) => (
              <motion.div 
                key={index}
                className="bg-gray-700 rounded-lg shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <img src={card.image} alt={card.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-16 bg-gray-900 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Lo Que Dicen Nuestros Beneficiarios
          </motion.h2>
          <div className="relative" ref={containerRef}>
            <div className="overflow-hidden">
              <motion.div
                className="flex"
                animate={controls}
                style={{ width: `${(testimonials.length + 3) * 100 / 3}%` }}
              >
                {[...testimonials, ...testimonials.slice(0, 3)].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    className="w-1/3 flex-shrink-0 px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                  >
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center h-full">
                      <img src={testimonial.image} alt={testimonial.name} className="w-20 h-20 rounded-full mb-4" />
                      <p className="text-center mb-2 flex-grow">{testimonial.comment}</p>
                      <p className="font-semibold">{testimonial.name}</p>
                      <div className="flex mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Sobre Solvia
          </motion.h2>
          <motion.p 
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            En Solvia, estamos comprometidos con la creación de un mundo más equitativo y justo mediante la implementación de programas que promueven el acceso a la educación y luchan contra las desigualdades sociales. Creemos firmemente que la educación es la clave para el progreso individual y colectivo.
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.p 
              className="text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              © 2023 Solvia. Todos los derechos reservados.
            </motion.p>
            <motion.div 
              className="flex space-x-4 mt-4 md:mt-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <a href="/login" className="hover:text-purple-400">Iniciar sesión</a>
              <a href="/register" className="hover:text-purple-400">Registrarse</a>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}

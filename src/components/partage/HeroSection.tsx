'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

const HeroSection: React.FC = () => {
  const stats = [
    {
      number: "100%",
      label: "Sans inscription",
      color: "text-blue-600"
    },
    {
      number: "9",
      label: "Destinations DOM-TOM",
      color: "text-orange-600"
    },
    {
      number: "24h",
      label: "Mise en ligne",
      color: "text-green-600"
    },
    {
      number: "0€",
      label: "Commission",
      color: "text-purple-600"
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-20 pb-16">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative container mx-auto px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge d'introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-6 py-3 mb-8 shadow-lg"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Plateforme collaborative de conteneurs partagés
            </span>
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            style={{ fontFamily: '"Roboto Slab", serif' }}
          >
            Trouvez ou proposez une place dans un{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              conteneur partagé
            </span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: '"Lato", sans-serif' }}
          >
            Mise en relation directe entre la France métropolitaine et les territoires DOM-TOM. 
            <br className="hidden md:block" />
            <span className="text-blue-600 font-semibold">Économique • Écologique • Efficace</span>
          </motion.p>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button 
              variant="primary" 
              size="lg"
              className="shadow-2xl shadow-blue-500/30"
            >
              🚢 Déposer une annonce
            </Button>
            <Button 
              variant="outline" 
              size="lg"
            >
              👥 Parcourir les annonces
            </Button>
          </motion.div>

          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="group"
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Texte de confiance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-gray-500 font-medium">
              ✨ Propulsé par{' '}
              <span className="text-blue-600 font-semibold">Dodomove</span> •{' '}
              <span className="text-green-600">+1000 conteneurs expédiés</span> •{' '}
              <span className="text-orange-600">Depuis 2020</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
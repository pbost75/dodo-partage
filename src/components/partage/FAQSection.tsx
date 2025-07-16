'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Comment trouver une place dans un conteneur partagé ?",
    answer: "Vous avez trois options simples :<br/>– Recherchez parmi les annonces existantes avec la barre de recherche (filtrez par lieu, volume, gratuit ou payant)<br/>– Postez votre propre annonce si vous ne trouvez pas ce que vous cherchez<br/>– Activez une alerte email pour être automatiquement notifié dès qu'une nouvelle annonce correspond à vos critères."
  },
  {
    question: "Comment modifier/supprimer une annonce ?",
    answer: "Pour modifier ou supprimer votre annonce, il vous suffit de :<br/><br/><strong>1️⃣ Retrouver l'email de confirmation reçu lors de la publication.</strong><br/><br/>Objet de l'email : <strong>« ✅ Votre annonce DodoPartage est maintenant publiée ! »</strong><br/><br/>💡 <strong>Astuce :</strong> recherchez dans votre boîte mail (y compris spams/indésirables) en tapant \"DodoPartage\".<br/><br/><strong>2️⃣ Cliquer sur le lien personnel contenu dans cet email.</strong> Il vous permettra de :<br/>– <strong>✏️ Modifier</strong> votre annonce<br/>– <strong>🗑️ Supprimer</strong> votre annonce si besoin"
  },
  {
    question: "Que faire si je ne reçois pas le mail de vérification ?",
    answer: "Si vous ne recevez pas l'email de vérification dans les 5 minutes :<br/><br/>• <strong>Vérifiez votre dossier de courriers indésirables/spam</strong><br/>• <strong>Vérifiez que l'adresse email saisie est correcte</strong><br/>• <strong>Ajoutez hello@dodomove.fr à vos contacts</strong> pour éviter le filtrage<br/>• <strong>Si le problème persiste après 1 heure,</strong> contactez-nous à hello@dodomove.fr avec votre numéro d'annonce"
  },
  {
    question: "Comment paramétrer une alerte de recherche ?",
    answer: "Pour créer une alerte de recherche :<br/><br/><strong>1.</strong> Utilisez notre outil de recherche en sélectionnant vos critères (destinations, dates, type de transport)<br/><strong>2.</strong> Cliquez sur <strong>'Créer une alerte'</strong> pour être notifié par email<br/><strong>3.</strong> Vous recevrez automatiquement un email dès qu'une nouvelle annonce correspond à vos critères<br/><strong>4.</strong> Vous pouvez désactiver l'alerte à tout moment via le lien dans l'email de notification"
  },
  {
    question: "Puis-je envoyer des objets volumineux comme une moto ou un frigo ?",
    answer: "Oui, tant que vous trouvez une annonce avec assez d'espace. Précisez toujours les dimensions pour éviter les mauvaises surprises."
  },
  {
    question: "Dois-je créer un compte pour utiliser DodoPartage ?",
    answer: "Non. Il suffit de vérifier votre adresse email pour publier ou contacter une annonce. Pas besoin de mot de passe ni de profil à gérer."
  },
  {
    question: "Combien ça coûte en général de partager un conteneur (groupage) ?",
    answer: "Les tarifs varient selon la destination, le volume à envoyer et l'accord trouvé entre les deux parties. En moyenne, il faut compter entre 100 € et 250 € par mètre cube pour un envoi groupé vers les DOM-TOM.<br/><br/>👉 Sur DodoPartage, c'est le propriétaire du conteneur qui décide : il peut proposer sa place gratuitement (pour ne pas gaspiller d'espace) ou demander une participation aux frais. Le type d'annonce est toujours indiqué clairement : \"Gratuit\" ou \"Participation aux frais\"."
  },
  {
    question: "Comment se fait la prise de contact entre utilisateurs ?",
    answer: "Lorsque vous envoyez un message via une annonce, il est transmis par email à la personne concernée. Elle peut vous répondre directement. Si vous avez laissé votre numéro, il sera joint dans l'email."
  },
  {
    question: "Puis-je proposer une place dans mon conteneur si je pars moi-même ?",
    answer: "Oui ! C'est même une excellente manière de rentabiliser l'espace inutilisé. Vous publiez une annonce, et gérez les réponses reçues directement par email."
  },
  {
    question: "Qui fixe les conditions de l'envoi (prix, volume, lieu, date) ?",
    answer: "Tout est discuté librement entre vous. DodoPartage facilite la mise en relation, mais n'intervient pas dans l'accord final."
  },
  {
    question: "Combien de temps faut-il pour trouver une place dans un conteneur ?",
    answer: "En moyenne, les premiers contacts arrivent en quelques jours. En activant une alerte email, vous êtes averti dès qu'une nouvelle annonce correspond à vos besoins."
  },
  {
    question: "Le service est-il sécurisé ?",
    answer: "DodoPartage n'intervient pas dans les échanges ni les paiements. Pour plus de sécurité, échangez clairement par email et convenez ensemble des modalités."
  },
  {
    question: "Puis-je utiliser DodoPartage pour un déménagement depuis les DOM-TOM vers la métropole ?",
    answer: "Absolument. Le service fonctionne dans les deux sens : que vous partiez de métropole ou des DOM-TOM, vous pouvez chercher ou proposer une place."
  },
  {
    question: "Quels objets sont interdits ou déconseillés dans un conteneur partagé ?",
    answer: "Évitez les objets de grande valeur, périssables ou dangereux (produits inflammables, batteries lithium…). En cas de doute, demandez à votre interlocuteur."
  },
  {
    question: "Vers quelles destinations DOM-TOM puis-je envoyer mes affaires en groupage ?",
    answer: "DodoPartage vous permet de trouver ou proposer une place dans un conteneur de groupage vers la Réunion, la Guadeloupe, la Martinique, la Guyane, Mayotte, la Nouvelle-Calédonie, et d'autres destinations DOM-TOM. Vous pouvez également organiser un retour vers la métropole depuis ces territoires. Pour chaque destination, vous pouvez filtrer les annonces selon votre ville de départ et la période souhaitée."
  },
  {
    question: "L'utilisation de DodoPartage est-elle vraiment gratuite ?",
    answer: "Oui. Publier ou répondre à une annonce est 100 % gratuit. DodoPartage ne prend aucune commission et ne gère aucun paiement. Les échanges sont libres entre utilisateurs."
  }
];

interface FAQItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItemComponent({ item, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-base font-semibold text-[#243163] pr-4 leading-relaxed font-title" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
          {item.question}
        </h3>
        <div className="flex-shrink-0">
          {isOpen ? (
            <Minus className="w-5 h-5 text-[#F47D6C]" />
          ) : (
            <Plus className="w-5 h-5 text-[#F47D6C]" />
          )}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 border-t border-gray-100">
              <div 
                className="text-gray-600 leading-relaxed font-lato pt-4"
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  // Diviser les questions en deux colonnes pour desktop
  const leftColumnItems = faqData.filter((_, index) => index % 2 === 0);
  const rightColumnItems = faqData.filter((_, index) => index % 2 === 1);

  return (
    <section className="w-full bg-gradient-to-b from-[#EFEEFF] to-[#E6E7FF] py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header de la section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 lg:mb-16"
        >
          {/* Badge FAQ avec lignes décoratives */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex-1 h-px bg-gray-400 max-w-24"></div>
            <div className="px-4">
              <span className="text-sm font-medium text-gray-600 tracking-wider uppercase">FAQ</span>
            </div>
            <div className="flex-1 h-px bg-gray-400 max-w-24"></div>
          </div>

          {/* Titre principal */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#243163] mb-4 font-title leading-tight" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
            Vos questions fréquentes
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 font-lato max-w-2xl mx-auto leading-relaxed">
            Vous cherchez une information ? On tente de répondre à toutes vos questions via notre FAQ.
          </p>
        </motion.div>

        {/* Grille des questions FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
        >
          {/* Colonne gauche - Desktop uniquement */}
          <div className="hidden lg:block space-y-4">
            {leftColumnItems.map((item, index) => (
              <FAQItemComponent
                key={index * 2}
                item={item}
                isOpen={openItems.has(index * 2)}
                onToggle={() => toggleItem(index * 2)}
              />
            ))}
          </div>

          {/* Colonne droite - Desktop uniquement */}
          <div className="hidden lg:block space-y-4">
            {rightColumnItems.map((item, index) => (
              <FAQItemComponent
                key={index * 2 + 1}
                item={item}
                isOpen={openItems.has(index * 2 + 1)}
                onToggle={() => toggleItem(index * 2 + 1)}
              />
            ))}
          </div>

          {/* Colonne unique - Mobile et tablet */}
          <div className="lg:hidden col-span-full space-y-4">
            {faqData.map((item, index) => (
              <FAQItemComponent
                key={index}
                item={item}
                isOpen={openItems.has(index)}
                onToggle={() => toggleItem(index)}
              />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
} 
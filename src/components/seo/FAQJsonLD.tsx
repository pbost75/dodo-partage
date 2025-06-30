'use client';

import { useEffect } from 'react';

const faqData = [
  {
    question: "Comment trouver une place dans un conteneur partagé ?",
    answer: "Vous avez trois options simples : recherchez parmi les annonces existantes avec la barre de recherche (filtrez par lieu, volume, gratuit ou payant), postez votre propre annonce si vous ne trouvez pas ce que vous cherchez, ou activez une alerte email pour être automatiquement notifié dès qu'une nouvelle annonce correspond à vos critères."
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
    answer: "Les tarifs varient selon la destination, le volume à envoyer et l'accord trouvé entre les deux parties. En moyenne, il faut compter entre 100 € et 250 € par mètre cube pour un envoi groupé vers les DOM-TOM. Sur DodoPartage, c'est le propriétaire du conteneur qui décide : il peut proposer sa place gratuitement (pour ne pas gaspiller d'espace) ou demander une participation aux frais. Le type d'annonce est toujours indiqué clairement : 'Gratuit' ou 'Participation aux frais'."
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
    question: "Faut-il un contrat ou des documents pour utiliser DodoPartage ?",
    answer: "Non. La plateforme ne gère ni contrat, ni formalités. Si vous passez par un professionnel, il pourra vous fournir ses propres documents si besoin."
  },
  {
    question: "L'utilisation de DodoPartage est-elle vraiment gratuite ?",
    answer: "Oui. Publier ou répondre à une annonce est 100 % gratuit. DodoPartage ne prend aucune commission et ne gère aucun paiement. Les échanges sont libres entre utilisateurs."
  }
];

export default function FAQJsonLD() {
  useEffect(() => {
    // Créer le schéma JSON-LD pour la FAQ
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "name": "FAQ DodoPartage - Questions fréquentes sur le groupage conteneur DOM-TOM",
      "description": "Réponses aux questions les plus fréquentes sur DodoPartage, la plateforme de partage de conteneurs entre la France métropolitaine et les DOM-TOM.",
      "url": "https://www.dodomove.fr/partage",
      "publisher": {
        "@type": "Organization",
        "name": "DodoPartage",
        "url": "https://www.dodomove.fr/partage",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.dodomove.fr/images/logo-dodomove-positif.png"
        }
      },
      "mainEntity": faqData.map((item, index) => ({
        "@type": "Question",
        "name": item.question,
        "position": index + 1,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer,
          "author": {
            "@type": "Organization",
            "name": "DodoPartage"
          }
        }
      }))
    };

    // Ajouter le script JSON-LD au head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(faqSchema, null, 2);
    script.id = 'faq-jsonld-script';

    // Supprimer le script existant s'il y en a un
    const existingScript = document.getElementById('faq-jsonld-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Ajouter le nouveau script
    document.head.appendChild(script);

    // Debug en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 FAQ JSON-LD Schema ajouté:', faqSchema);
    }

    // Nettoyage lors du démontage du composant
    return () => {
      const scriptToRemove = document.getElementById('faq-jsonld-script');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
} 
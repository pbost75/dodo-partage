'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronDown, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import FloatingInput from '@/components/ui/FloatingInput';
import EmailInput from '@/components/ui/EmailInput';
import FloatingTextarea from '@/components/ui/FloatingTextarea';
import PhoneInput from '@/components/ui/PhoneInput';
import { apiFetch } from '@/utils/apiUtils';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: {
    id: string;
    type: 'offer' | 'request';
    departure: string;
    arrival: string;
    volume: string;
    date: string;
    author: string;
  };
}

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, announcement }) => {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const phoneFieldRef = useRef<HTMLDivElement>(null);

  // Détection du viewport mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Validation de l'email en temps réel
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newIsEmailValid = emailRegex.test(form.email);
    
    // Auto-scroll vers le champ téléphone quand il apparaît
    if (!isEmailValid && newIsEmailValid) {
      setTimeout(() => {
        phoneFieldRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 350); // Délai pour laisser l'animation se terminer
    }
    
    setIsEmailValid(newIsEmailValid);
  }, [form.email, isEmailValid]);

  // Vérification si le formulaire est valide
  const isFormValid = form.name.trim().length >= 2 && 
                     isEmailValid && 
                     form.message.trim().length >= 10;

  // Message par défaut intelligent selon le type d'annonce
  const getDefaultMessage = () => {
    if (announcement.type === 'offer') {
      return `Bonjour ${announcement.author},\n\nJe suis intéressé(e) par votre annonce pour le trajet ${announcement.departure} → ${announcement.arrival} (${announcement.volume}).\n\nPouvez-vous me donner plus de détails ?\n\nMerci !`;
    } else {
      return `Bonjour ${announcement.author},\n\nJ'ai de la place disponible dans mon conteneur pour votre trajet ${announcement.departure} → ${announcement.arrival}.\n\nContactez-moi pour qu'on en discute !\n\nCordialement`;
    }
  };

  // Reset du formulaire à l'ouverture
  React.useEffect(() => {
    if (isOpen && !form.message) {
      // On ne pré-remplit plus le message, on laisse vide pour que l'utilisateur écrive
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiFetch('/api/contact-announcement', {
        method: 'POST',
        body: JSON.stringify({
          announcementId: announcement.id,
          contactName: form.name,
          contactEmail: form.email,
          contactPhone: form.phone,
          message: form.message,
          announcementDetails: announcement
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        // Fermer automatiquement après 2 secondes
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (error) {
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset après la fermeture
    setTimeout(() => {
      setForm({ name: '', email: '', phone: '', message: '' });
      setIsSuccess(false);
    }, 300);
  };

  if (isSuccess) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">🚢</div>
              <h3 className="text-2xl font-bold text-blue-900 font-['Roboto_Slab'] mb-3">
                Message envoyé !
              </h3>
              <p className="text-gray-700">
                {announcement.author} va recevoir votre message et pourra vous contacter directement par email.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 ${isMobile ? 'bg-white' : 'bg-black/50 flex items-center justify-center p-4'}`}
          onClick={!isMobile ? handleClose : undefined}
        >
          <motion.div
            initial={isMobile ? { y: '100%' } : { scale: 0.8, opacity: 0 }}
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { y: '100%' } : { scale: 0.8, opacity: 0 }}
            className={`bg-white shadow-xl w-full ${
              isMobile 
                ? 'h-full flex flex-col' 
                : 'rounded-2xl max-w-lg max-h-[85vh] flex flex-col overflow-hidden'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header compact */}
            <div className={`flex items-center justify-between border-b border-gray-50 ${
              isMobile ? 'p-4 sticky top-0 bg-white z-10' : 'px-6 py-5'
            }`}>
              <div>
                <h3 className={`font-semibold text-gray-900 ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}>
                  Contacter {announcement.author}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {announcement.departure} → {announcement.arrival} • {announcement.volume}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <div className={`flex-1 overflow-y-auto ${isMobile ? '' : 'min-h-0'}`}>
              <form onSubmit={handleSubmit} className={`${
                isMobile ? 'p-4 pb-8' : 'p-6 pt-8'
              }`}>
                {/* Section Contact */}
                <div className="space-y-5">
                  <FloatingInput
                    label="Votre nom"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Marie Payet"
                    fixedLabel={true}
                  />

                  <div>
                    <EmailInput
                      label="Votre email"
                      name="email"
                      value={form.email}
                      onChange={(name, value) => setForm(prev => ({ ...prev, email: value }))}
                      required
                      fixedLabel={true}
                    />
                  </div>

                  {/* Téléphone - Apparaît après validation email */}
                  <AnimatePresence>
                    {isEmailValid && (
                      <motion.div
                        ref={phoneFieldRef}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative">
                          <div className="flex items-center mb-3">
                            <img 
                              src="https://www.dodomove.fr/wp-content/uploads/2025/07/vecteezy_whatsapp-logo-png-whatsapp-icon-png-whatsapp-transparent_18930564.webp" 
                              alt="WhatsApp" 
                              className="w-7 h-7"
                            />
                            <span className="text-base text-gray-700 font-['Lato'] font-medium">Numéro WhatsApp</span>
                          </div>
                          <div className="space-y-0">
                            <PhoneInput
                              label=""
                              value={form.phone}
                              onChange={(value) => setForm(prev => ({ ...prev, phone: value }))}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Ajoutez votre numéro pour être recontacté plus rapidement. Le propriétaire pourra vous répondre directement via WhatsApp.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Section Message */}
                <div className="mt-6">
                  <FloatingTextarea
                    label="Votre message"
                    name="message"
                    required
                    value={form.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder={
                      announcement.type === 'offer'
                        ? `Précisez toutes infos utiles (ex: votre besoin en m3, la nature des objets, le lieu de récupération)...`
                        : `Précisez toutes infos utiles (ex: les types d'objets acceptés, le tarif proposé, le lieu de récupération, le lieu de livraison)...`
                    }
                    fixedLabel={true}
                  />
                </div>

              </form>
            </div>

            {/* CTA élégant - Desktop et Mobile */}
            <div className={`sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-50 z-10 ${
              isMobile ? 'p-4' : 'px-6 py-5'
            }`}>
              <Button
                type="button"
                loading={isSubmitting}
                disabled={!isFormValid}
                onClick={() => handleSubmit(new Event('submit') as any)}
                icon={<Send className="w-4 h-4" />}
                iconPosition="left"
                className="w-full h-12 bg-[#F47D6C] hover:bg-[#e05a48] text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-medium shadow-sm"
              >
                Envoyer le message
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal; 
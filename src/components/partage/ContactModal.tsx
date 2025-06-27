'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import FloatingInput from '@/components/ui/FloatingInput';
import EmailInput from '@/components/ui/EmailInput';
import FloatingTextarea from '@/components/ui/FloatingTextarea';
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
  message: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, announcement }) => {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      setForm({ name: '', email: '', message: '' });
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-blue-900 font-['Roboto_Slab']">
                  Contacter {announcement.author}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {announcement.departure} → {announcement.arrival} • {announcement.volume}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Nom */}
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

              {/* Email */}
              <div>
                <EmailInput
                  label="Votre email"
                  name="email"
                  value={form.email}
                  onChange={(name, value) => setForm(prev => ({ ...prev, email: value }))}
                  required
                  fixedLabel={true}
                />
                <p className="text-xs text-gray-500 mt-2 font-['Lato']">
                  {announcement.author} pourra vous répondre directement à cette adresse
                </p>
              </div>

              {/* Message */}
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

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                  iconPosition="left"
                  className="flex-1 bg-[#F47D6C] hover:bg-[#e05a48] text-white"
                >
                  Envoyer
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal; 
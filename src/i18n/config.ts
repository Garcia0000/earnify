import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const spanishSpeakingCountries = ['MX', 'CO', 'AR', 'CL', 'PE', 'VE', 'ES', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PR', 'UY', 'PA'];

export const getLanguageByCountry = (countryCode: string) => {
  return spanishSpeakingCountries.includes(countryCode.toUpperCase()) ? 'es' : 'en';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          dashboard: "Dashboard",
          offers: "Offers",
          withdraw: "Withdraw",
          referrals: "Referrals",
          admin: "Admin",
          balance: "Current Balance",
          total_earned: "Total Earned",
          completed: "Offers Completed",
          min_withdraw: "Minimum payout: $5.00",
          method: "Payment Method",
          paypal: "PayPal",
          bank: "Bank Transfer",
          request: "Withdraw Now",
          no_offers: "No offers available for your region.",
          invite_friends: "Earn 10% commission on referrals!",
          copy_link: "Copy Link",
          admin_rev: "Revenue",
          admin_paid: "Paid",
          admin_margin: "Margin",
          status_pending: "Pending",
          status_approved: "Approved",
          status_paid: "Paid",
          status_rejected: "Rejected",
          login: "Sign In",
          register: "Sign Up",
          logout: "Log Out",
          google_login: "Continue with Google",
          payout_details: "Account Information",
          welcome: "Welcome back!",
          ready_to_earn: "Ready to make some money?",
        }
      },
      es: {
        translation: {
          dashboard: "Tablero",
          offers: "Ofertas",
          withdraw: "Retirar",
          referrals: "Referidos",
          admin: "Panel Admin",
          balance: "Saldo Disponible",
          total_earned: "Ganancias Totales",
          completed: "Ofertas Completadas",
          min_withdraw: "Retiro mínimo: $5.00",
          method: "Método de Pago",
          paypal: "PayPal",
          bank: "Transferencia",
          request: "Solicitar Pago",
          no_offers: "Sin ofertas en tu región.",
          invite_friends: "¡Gana 10% por cada referido!",
          copy_link: "Copiar Enlace",
          admin_rev: "Ingresos",
          admin_paid: "Pagado",
          admin_margin: "Margen",
          status_pending: "Pendiente",
          status_approved: "Aprobado",
          status_paid: "Pagado",
          status_rejected: "Rechazado",
          login: "Entrar",
          register: "Registrarse",
          logout: "Salir",
          google_login: "Continuar con Google",
          payout_details: "Detalles de Cuenta",
          welcome: "¡Bienvenido!",
          ready_to_earn: "¿Listo para ganar dinero?",
        }
      }
    }
  });

export default i18n;

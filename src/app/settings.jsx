import { FaHome, FaCar } from "react-icons/fa";
import { RiCake2Fill, RiMoneyEuroCircleFill } from "react-icons/ri";
import { TbCashRegister } from "react-icons/tb";
import { LuNotebookTabs } from "react-icons/lu";
import { MdOutlineAssignment } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";

//ICONE SOCIAL

// const ICONfacebook = <FacebookIcon/>
// const ICONwhatsApp = <FaWhatsappSquare/>
// const ICONtikTok = <AiFillTikTok />
// const ICONinstagram = <FaInstagramSquare/>
// const ICONtel = <FaPhoneSquareAlt/>
// const ICONemail = <FaEnvelope/>

// FOOTER SIGN

export const poweredBy = "powered 💜 dropboost.it"
export const description = "HI-PHOTO | sito e gestionale per fotografi"
export const version = "2.5.0"

// MANAGER MODULE

export const navManager = [
  {
    title: "Home",
    icon: FaHome,
    isActive: true,
    items: [
      { title: "Sito", url: "/" },
      { title: "Gestionale", url: "/manager" },
    ],
    level: ["admin", "superadmin"],
  },
  {
    title: "Garage",
    icon: FaCar,
    isActive: true,
    items: [
      { title: "Aggiungi Annuncio", url: "/manager/garage/aggiungi-auto" },
    ],
    level: ["admin", "superadmin"],
  },
  // {
  //   title: "Eventi",
  //   icon: RiCake2Fill,
  //   isActive: true,
  //   items: [
  //     { title: "Crea Evento", url: "/manager/event/create-event" },
  //     { title: "Aggiungi Media", url: "/manager/event/add-items-event" },
  //     { title: "Gestione Eventi", url: "/manager/event/event-management" },
  //   ],
  //   level: ["admin", "superadmin"],
  // },
  // {
  //   title: "Work",
  //   icon: TbCashRegister,
  //   isActive: true,
  //   items: [
  //     { title: "Servizi", url: "/manager/work/servizi" },
  //     { title: "Anagrafica", url: "/manager/work/anagrafica" },
  //     { title: "Redazione", url: "/manager/work/redazione" },
  //     { title: "Preventivi", url: "/manager/work/preventivi" },
  //     { title: "Contratti", url: "/manager/work/contratti" },
  //   ],
  //   level: ["admin", "superadmin"],
  // },
  // {
  //   title: "Finanza",
  //   icon: RiMoneyEuroCircleFill,
  //   isActive: true,
  //   items: [
  //     { title: "Analisi", url: "/manager/finanza/analisi" },
  //     { title: "Schede Clienti", url: "/manager/finanza/schede-clienti" },
  //   ],
  //   level: ["admin", "superadmin"],
  // },
  // {
  //   title: "Agenda",
  //   icon: LuNotebookTabs,
  //   isActive: true,
  //   items: [
  //     { title: "Calendario", url: "/manager/agenda/calendario" },
  //   ],
  //   level: ["admin", "superadmin"],
  // },
  // {
  //   title: "Richieste",
  //   icon: MdOutlineAssignment,
  //   isActive: true,
  //   items: [
  //     { title: "Contatti", url: "/manager/richieste/contatti" },
  //   ],
  //   level: ["admin", "superadmin"],
  // },
  {
    title: "Impostazioni",
    icon: IoIosSettings,
    isActive: true,
    items: [
      { title: "Impostazioni", url: "/manager/settings" },
      { title: "Abilita Utenza", url: "/manager/settings/register" },
    ],
    level: ["admin", "superadmin"],
  },
];


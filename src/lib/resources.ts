export type ResourceSection = {
  heading: string;
  paragraphs: string[];
};

export type ResourceArticle = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readMinutes: number;
  intro: string;
  sections: ResourceSection[];
  takeaways: string[];
};

const DISCLAIMER =
  "This article is general guidance, not legal advice. Requirements change and can depend on the specific goods you are moving. Confirm the current rules with the Nigeria Customs Service or a licensed customs broker before you import or export.";

export const RESOURCES: ResourceArticle[] = [
  {
    slug: "documents-to-import-into-nigeria",
    title: "Documents required to import goods into Nigeria",
    description:
      "A practical checklist of the paperwork Nigerian importers need, from the commercial invoice and bill of lading to Form M, PAAR, SONCAP, NAFDAC, and the CISS and ETLS levies.",
    publishedAt: "2026-06-02",
    readMinutes: 6,
    intro:
      "Importing goods into Nigeria involves more than paying a supplier and waiting for a container. The Nigeria Customs Service and several agencies need a specific set of documents before your cargo can leave the port. Missing one, or getting one detail wrong, is the most common reason shipments sit idle and attract demurrage. This guide walks through the documents that matter most and what each one is for.",
    sections: [
      {
        heading: "The core commercial documents",
        paragraphs: [
          "The commercial invoice is the supplier's bill to you. It must show the buyer and seller, a full description of the goods, HS codes, quantity, unit price, total value, currency, Incoterms, and payment terms. Customs uses it to confirm the value and calculate duty.",
          "The packing list shows how the goods are packed: the number of cartons or pallets, weights, dimensions, and shipping marks. It helps customs and terminal staff confirm that what arrived matches what was declared.",
          "The bill of lading is the contract of carriage for sea freight and the document that proves ownership of the cargo. For air freight you receive an air waybill instead. Check that the consignee name, goods description, and weight agree with your other documents.",
          "A certificate of origin shows where the goods were made. It can reduce or remove duty when a trade agreement applies, for example under the ECOWAS Trade Liberalisation Scheme.",
        ],
      },
      {
        heading: "Form M",
        paragraphs: [
          "Form M is the import declaration you raise through an authorised dealer bank on the Nigeria Single Window for Trade. It captures who is importing, who is supplying, the goods and their HS codes, the value, the currency, the Incoterms, and the payment method.",
          "Once the bank validates it, you receive a Form M number. That number ties the shipment to one approved transaction and must appear on your shipping documents. Form M is normally required for commercial imports, and the shipment details must match it exactly.",
        ],
      },
      {
        heading: "PAAR",
        paragraphs: [
          "The Pre-Arrival Assessment Report is issued by the Nigeria Customs Service before your goods arrive. It is built from the validated Form M and the shipping documents, such as the final invoice and bill of lading.",
          "The PAAR states the duty and taxes assessed on the shipment and is what the clearing agent uses to pay and collect the goods. Because it is prepared in advance, it is your best chance to catch a problem before the cargo lands.",
        ],
      },
      {
        heading: "SONCAP and product certification",
        paragraphs: [
          "The Standards Organisation of Nigeria Conformity Assessment Programme applies to regulated products such as electrical goods, toys, chemicals, and building materials. It has two stages: a Product Certificate that confirms the product meets the relevant standard, and a SONCAP Certificate for each shipment.",
          "Regulated goods without a valid SONCAP certificate are not cleared, so arrange certification before the goods are shipped rather than after they arrive.",
        ],
      },
      {
        heading: "NAFDAC for regulated products",
        paragraphs: [
          "NAFDAC regulates food, drugs, cosmetics, medical devices, bottled water, and chemicals. If your goods fall under its remit, you need the appropriate registration and an import permit.",
          "Start this process early. Registration can take weeks and is specific to the product and the manufacturer, so it cannot be sorted out while the container waits at the port.",
        ],
      },
      {
        heading: "Levies: CISS and ETLS",
        paragraphs: [
          "Beyond import duty, two levies commonly apply. The Comprehensive Import Supervision Scheme is charged at 1% of the FOB value of the goods. The ECOWAS community levy, often called the ETLS levy, is charged at 0.5% of the CIF value on imports from outside ECOWAS.",
          "If your goods qualify under the ECOWAS Trade Liberalisation Scheme, a valid certificate of origin can remove the duty. The levy treatment still depends on the origin of the goods and the rules in force at the time of import.",
        ],
      },
      {
        heading: "Disclaimer",
        paragraphs: [DISCLAIMER],
      },
    ],
    takeaways: [
      "The core set is a commercial invoice, packing list, bill of lading or air waybill, and certificate of origin.",
      "Form M is your import declaration and must match every shipping document.",
      "PAAR is issued by Customs before arrival and sets the duty you will pay.",
      "SONCAP and NAFDAC apply to regulated products and need to be started early.",
      "Budget for the 1% CISS levy on FOB and the 0.5% ECOWAS levy on CIF.",
    ],
  },
  {
    slug: "form-m-and-paar-explained",
    title: "Form M and PAAR explained",
    description:
      "What Form M and the Pre-Arrival Assessment Report are, the order you obtain them in, the errors that cause port delays, and how mismatches turn into demurrage.",
    publishedAt: "2026-06-16",
    readMinutes: 6,
    intro:
      "If you import into Nigeria, two documents decide how smoothly your cargo clears: Form M and the Pre-Arrival Assessment Report, usually called PAAR. They are connected, they are obtained in a set order, and small mistakes in either one are a leading cause of port delays. This guide explains what each document does and how to avoid the errors that cost traders money.",
    sections: [
      {
        heading: "What Form M is",
        paragraphs: [
          "Form M is the formal record of your import transaction. You raise it through an authorised dealer bank on the Nigeria Single Window for Trade. It captures the importer, the supplier, the goods and their HS codes, the value, the currency, the Incoterms, and how you will pay.",
          "After the bank validates it, you receive a Form M number. That number ties the shipment to a single approved transaction, and it must appear on your shipping documents.",
        ],
      },
      {
        heading: "What PAAR is",
        paragraphs: [
          "The Pre-Arrival Assessment Report is issued by the Nigeria Customs Service. It is generated from your validated Form M and the supporting shipping documents, such as the final invoice, packing list, and bill of lading.",
          "The PAAR states the duty and taxes assessed on the shipment. Your clearing agent uses it to make payment and take delivery. As the name suggests, it is prepared before the goods arrive.",
        ],
      },
      {
        heading: "The order they are obtained",
        paragraphs: [
          "First, register and validate Form M through your bank. Second, ship the goods, or at least receive the final shipping documents. Third, submit those documents so Customs can issue the PAAR. Fourth, clear the goods on arrival using the PAAR.",
          "Form M comes first. The PAAR depends on it, and you cannot validly start clearance without both.",
        ],
      },
      {
        heading: "Common errors",
        paragraphs: [
          "Names and addresses that differ between the Form M, the invoice, and the bill of lading. The wrong HS code, or a code that does not match the goods described. An invoice value that does not match the value declared on the Form M.",
          "Incorrect Incoterms, which changes the value Customs assesses. A missing Form M number on the shipping documents. Regulated goods shipped without SONCAP or NAFDAC clearance. Even small typos in the consignee name or goods description can stall a shipment.",
        ],
      },
      {
        heading: "How mistakes cause delays and demurrage",
        paragraphs: [
          "When the details do not match, Customs will not release the goods until the discrepancy is resolved. The cargo stays at the terminal, and the clock on free storage runs out.",
          "After that, the shipping line charges demurrage for the container and the terminal charges storage. These costs add up daily and are charged to you, not to the supplier. A few minutes spent checking consistency before you ship is far cheaper than a week of demurrage.",
        ],
      },
      {
        heading: "Disclaimer",
        paragraphs: [DISCLAIMER],
      },
    ],
    takeaways: [
      "Form M is your import declaration; the PAAR is the Customs assessment built from it.",
      "Form M comes first, then the PAAR, then clearance.",
      "Every name, value, HS code, and Incoterm must match across documents.",
      "Mismatches freeze the cargo and trigger demurrage and storage charges.",
      "Check the Form M number appears on the shipping documents before you ship.",
    ],
  },
  {
    slug: "incoterms-2020-explained",
    title: "Incoterms 2020 explained for Nigerian traders",
    description:
      "The 11 Incoterms 2020 rules, sea-only versus any-mode, why the named place matters, common mistakes such as FOB by air, and what Incoterms do not cover.",
    publishedAt: "2026-07-07",
    readMinutes: 7,
    intro:
      "Incoterms are the three-letter rules that say who arranges and pays for each stage of a shipment, and where risk passes from seller to buyer. The 2020 edition from the International Chamber of Commerce is the current version. For Nigerian traders, choosing the wrong term, or the wrong place, can shift thousands of dollars of cost onto your side of the deal without warning. Here is a plain-language guide to the 11 rules.",
    sections: [
      {
        heading: "What Incoterms do",
        paragraphs: [
          "An Incoterm answers three questions: who arranges and pays for transport and related costs, where the seller's responsibility ends and the buyer's begins, and at what point risk passes.",
          "They are a shared shorthand that reduces disputes, but they only cover the delivery of goods. They say nothing about the price you negotiate or how you pay.",
        ],
      },
      {
        heading: "The 11 rules",
        paragraphs: [
          "The 2020 edition has 11 rules. EXW (Ex Works), FCA (Free Carrier), CPT (Carriage Paid To), CIP (Carriage and Insurance Paid To), DAP (Delivered at Place), DPU (Delivered at Place Unloaded), and DDP (Delivered Duty Paid) can be used for any mode of transport.",
          "FAS (Free Alongside Ship), FOB (Free on Board), CFR (Cost and Freight), and CIF (Cost, Insurance and Freight) are for sea and inland waterway transport only.",
        ],
      },
      {
        heading: "Sea-only versus any-mode",
        paragraphs: [
          "The four sea-only rules are tied to loading goods onto a ship. They do not fit containerised cargo that is handed over at a terminal, and they do not fit air freight at all.",
          "For containers and air cargo, use the any-mode rules, particularly FCA, CPT, and CIP. A common and expensive mistake is agreeing to FOB for goods that travel by air.",
        ],
      },
      {
        heading: "The named place",
        paragraphs: [
          "Every Incoterm must be followed by a named place, for example FCA Shanghai or CIF Apapa. The named place is where the seller's obligation ends.",
          "If you write only FCA or CIF with no place, the term is incomplete and disputes follow. Be specific enough that both sides agree on the exact point, such as a named terminal or warehouse.",
        ],
      },
      {
        heading: "Common mistakes",
        paragraphs: [
          "Using a sea-only rule such as FOB or CIF for air freight. Leaving out the named place, or naming a place that is too vague. Assuming DDP is simple, when it makes the seller responsible for import duty and clearance in Nigeria.",
          "Mixing the Incoterm with the payment method, as if CIF meant payment on delivery. Forgetting that under EXW the buyer carries almost every cost and risk from the seller's premises onward.",
        ],
      },
      {
        heading: "What Incoterms do not cover",
        paragraphs: [
          "Incoterms do not cover payment terms, currency, title to the goods, or the consequences of a breach of contract. They also do not replace customs requirements.",
          "Two shipments can use the same Incoterm and still have very different payment and ownership arrangements. Keep the Incoterm, the payment terms, and the contract separate, and make sure each is written clearly.",
        ],
      },
      {
        heading: "Disclaimer",
        paragraphs: [DISCLAIMER],
      },
    ],
    takeaways: [
      "Incoterms 2020 has 11 rules: 7 for any mode and 4 for sea only.",
      "Do not use FOB, CFR, CIF, or FAS for air or containerised cargo.",
      "Always name the place, and make it specific.",
      "Incoterms cover delivery, cost, and risk, not payment or title.",
      "Match the Incoterm to the actual mode of transport and the deal you negotiated.",
    ],
  },
  {
    slug: "hs-codes-explained",
    title: "HS codes explained",
    description:
      "What HS codes are, how six international digits differ from national tariff lines, why classification drives duty and levies, and how to choose a code carefully.",
    publishedAt: "2026-07-21",
    readMinutes: 5,
    intro:
      "Every product that crosses a border has an HS code: a number that tells customs what the goods are. That number drives the import duty, the levies, and often whether you need a permit at all. Getting it wrong is one of the most expensive mistakes in trade, because a wrong code can mean the wrong duty, a rejected declaration, or a shipment held at the port. This guide explains what HS codes are and how to choose one with care.",
    sections: [
      {
        heading: "What an HS code is",
        paragraphs: [
          "The Harmonised System is an international classification maintained by the World Customs Organisation. It groups traded goods into chapters, headings, and subheadings, and gives every product a shared identity across more than 200 countries.",
          "The first six digits are the same everywhere, which is what allows customs agencies to compare and assess the same product consistently.",
        ],
      },
      {
        heading: "Six digits international, more digits national",
        paragraphs: [
          "The six-digit HS code is the international standard. Individual countries extend it with additional digits for their own tariff lines.",
          "Nigeria uses an eight to ten digit national tariff based on the ECOWAS Common External Tariff. Two countries can share the same six-digit code and still apply different duty rates, because the extra national digits, and the national policy behind them, differ.",
        ],
      },
      {
        heading: "Why classification drives duty and levies",
        paragraphs: [
          "Duty is set per tariff line. One code might attract 5% and a neighbouring code 20%, and the difference can be the whole margin on a shipment.",
          "The code also determines whether a product is subject to levies such as the 1% CISS on FOB, and whether you need SONCAP, NAFDAC, or another permit. Because the code links to so many obligations, an incorrect code can trigger penalties even when the mistake was honest.",
        ],
      },
      {
        heading: "How to choose a code carefully",
        paragraphs: [
          "Start with the product itself, not the name your supplier uses. Consider what the item is made of, what it does, and how it is presented. Read the chapter and heading notes, because they can exclude or redirect a product.",
          "Compare the candidate codes and their duty rates, and check whether a permit applies. If the classification is unclear, ask the Nigeria Customs Service or a licensed customs broker for a ruling before you ship. Record the reasoning you used, so you can explain it if the shipment is queried.",
        ],
      },
      {
        heading: "Disclaimer",
        paragraphs: [DISCLAIMER],
      },
    ],
    takeaways: [
      "An HS code classifies your goods for customs and drives duty and permits.",
      "The first six digits are international; extra digits are national tariff lines.",
      "Small differences in a code can change the duty rate sharply.",
      "Classify by what the product is, using the chapter and heading notes.",
      "When in doubt, get a ruling from Customs or a licensed broker before shipping.",
    ],
  },
];

export function getResource(slug: string): ResourceArticle | undefined {
  return RESOURCES.find((article) => article.slug === slug);
}

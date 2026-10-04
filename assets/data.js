/* Chaulas Wale Hakim Ji: all editable content lives in this file.
   Prices are demonstration values carried over from V6. Product facts stay empty until approved. */
window.CWHJ = {
  brand: {
    name: 'Chaulas Wale Hakim Ji',
    parent: 'Swastha Ayurveda Pvt. Ltd.',
    since: 1939
  },

  offer: { code: 'PREVIEW10', percent: 10 },

  announcements: [
    'Ayurvedic heritage since 1939',
    'A Swastha Ayurveda Pvt. Ltd. brand',
    'Use code PREVIEW10 for 10% off your demo bag',
    'Preview store: prices and checkout are for demonstration'
  ],

  slides: [
    {
      title: 'Ayurvedic wisdom, rooted since 1939',
      sub: 'Traditional formulations, thoughtfully preserved for modern wellness.',
      image: 'ref-ras-e-jalali-original.jpg',
      alt: 'Ras e Jalali bottle on a wooden apothecary table',
      primary: { label: 'Shop the collection', to: '/shop' },
      secondary: { label: 'Our story', to: '/our-story' }
    },
    {
      title: 'Meet Majun Jalali',
      sub: 'An amber-toned jar, a dark lid and a label with a character of its own.',
      image: 'ref-majun-jalali-original.jpg', pos: '62% 50%',
      alt: 'Majun Jalali jar beside ceramic pots and herbs',
      primary: { label: 'View Majun Jalali', to: '/products/majun-jalali' }
    },
    {
      title: 'The gift of Ayurvedic tradition',
      sub: 'Three gift-box designs from the house of Chaulas Wale Hakim Ji.',
      image: 'ref-gift-wood-original.jpg',
      alt: 'Wooden Chaulas Wale Hakim Ji gift box holding two products',
      primary: { label: 'Explore gift sets', to: '/gift-sets' }
    }
  ],

  usps: [
    { icon: 'leaf', title: 'Since 1939', text: 'Family Ayurvedic heritage' },
    { icon: 'shield', title: 'Swastha Ayurveda', text: 'A Swastha Ayurveda Pvt. Ltd. brand' },
    { icon: 'bottle', title: 'Five formulations', text: 'Bottles and jars from one house' },
    { icon: 'gift', title: 'Gift sets', text: 'Three gift-box designs' }
  ],

  products: [
    {
      id: 'ras-e-jalali', name: 'Ras e Jalali', form: 'Bottle', price: 480,
      intro: 'Amber tones, parchment lettering and the detail of a dark cap. Meet Ras e Jalali, in its own space.',
      scene: 'ref-ras-e-jalali-original.jpg',
      gallery: [
        { src: 'ref-ras-e-jalali-cutout.webp', fit: 'contain', label: 'Product', cap: 'Product image with the background removed.' },
        { src: 'ref-ras-e-jalali-original.jpg', fit: 'cover', label: 'In its setting', cap: 'In its apothecary setting.' },
        { src: 'ref-ras-e-jalali-label.webp', fit: 'contain', label: 'Label', cap: 'A close crop of the front label.' },
        { src: 'ref-ras-e-jalali-crop.webp', fit: 'contain', label: 'Close-up', cap: 'A close-up crop of the same image.' }
      ]
    },
    {
      id: 'majun-jalali', name: 'Majun Jalali', form: 'Jar', price: 680,
      intro: 'An amber-toned jar, a dark lid and a label with a character of its own. Take your time with Majun Jalali.',
      scene: 'ref-majun-jalali-original.jpg', pos: '62% 50%',
      gallery: [
        { src: 'ref-majun-jalali-cutout.webp', fit: 'contain', label: 'Product', cap: 'Product image with the background removed.' },
        { src: 'ref-majun-jalali-original.jpg', fit: 'cover', label: 'In its setting', cap: 'In its apothecary setting.' },
        { src: 'ref-majun-jalali-label.webp', fit: 'contain', label: 'Label', cap: 'A close crop of the front label.' },
        { src: 'ref-majun-jalali-crop.webp', fit: 'contain', label: 'Close-up', cap: 'A close-up crop of the same image.' }
      ]
    },
    {
      id: 'ras-e-faulad', name: 'Ras e Faulad', form: 'Bottle', price: 540,
      intro: 'A dropper silhouette. A matching carton. A closer look at Ras e Faulad, without losing sight of the whole.',
      scene: 'ref-ras-e-faulad-original.jpg', pos: '54% 50%',
      gallery: [
        { src: 'ref-ras-e-faulad-cutout.webp', fit: 'contain', label: 'Product', cap: 'Product image with the background removed.' },
        { src: 'ref-ras-e-faulad-original.jpg', fit: 'cover', label: 'Bottle and carton', cap: 'Dropper bottle and carton together.' },
        { src: 'ref-ras-e-faulad-label.webp', fit: 'contain', label: 'Label', cap: 'A close crop of the front label.' },
        { src: 'ref-ras-e-faulad-crop.webp', fit: 'contain', label: 'Close-up', cap: 'A close-up crop of the same image.' }
      ]
    },
    {
      id: 'herbal-jari-booti-oil', name: 'Herbal Jari Booti Oil', form: 'Jar', price: 420, small: true,
      intro: 'Meet Herbal Jari Booti Oil through the gift-set image, then explore the formulation information and records in one place.',
      gallery: [
        { src: 'ref-gift-green-original.jpg', fit: 'cover', pos: '62% 50%', label: 'In the gift set', cap: 'Shown inside the ivory-and-green gift box. A standalone product photograph is still to come.' },
        { src: 'ref-herbal-jari-booti-oil-cutout.webp', fit: 'small', label: 'Product', cap: 'Cropped from the gift-set image, so detail is limited.' },
        { src: 'ref-herbal-jari-booti-oil-label.webp', fit: 'small', label: 'Label', cap: 'A crop of the visible front label.' }
      ]
    },
    {
      id: 'chyawanprash', name: 'Chyawanprash', form: 'Jar', price: 750, small: true,
      intro: 'A name in the collection, pictured within the wooden gift box. Discover Chyawanprash at your own pace.',
      gallery: [
        { src: 'ref-gift-wood-original.jpg', fit: 'cover', pos: '72% 50%', label: 'In the gift set', cap: 'Shown inside the wooden gift box. A standalone product photograph is still to come.' },
        { src: 'ref-chyawanprash-cutout.webp', fit: 'small', label: 'Product', cap: 'Cropped from the gift-set image, so detail is limited.' },
        { src: 'ref-chyawanprash-label.webp', fit: 'small', label: 'Label', cap: 'A crop of the visible front label.' }
      ]
    }
  ],

  principles: [
    { icon: 'book', title: 'Know the story', text: 'Start with the family, the heritage and the context behind the name.' },
    { icon: 'label', title: 'Read beyond the label', text: 'Ingredients, directions and cautions belong together, and should be easy to find before you buy.' },
    { icon: 'question', title: 'Leave room for questions', text: 'Traditional context and product evidence are not the same thing. We keep them apart.' }
  ],

  gifts: [
    { id: 'wood', name: 'Wooden gift box', image: 'ref-gift-wood-original.jpg', text: 'A carved wooden box with two products set inside.' },
    { id: 'green', name: 'Ivory and green gift box', image: 'ref-gift-green-original.jpg', text: 'A windowed box in ivory and deep green.' },
    { id: 'paper', name: 'Parchment gift box', image: 'ref-gift-paper-original.jpg', text: 'A parchment-style windowed box.' }
  ],

  articles: [
    {
      slug: 'a-slower-beginning', title: 'A slower beginning', category: 'Everyday rituals', image: 'journal-1.jpg',
      intro: 'Not every new ritual needs to begin with a purchase. Sometimes it begins with a little more attention.',
      sections: [
        ['Make room for a moment', 'A quiet shelf. A notebook. A few minutes without another open tab. We imagine this journal as a place to pause and become more curious about the things we bring into everyday life.'],
        ['Curiosity, before certainty', 'What is this formulation? What is actually in it? Where can I find the directions and cautions? There is room for simple questions, and good product information should make their answers easy to find.'],
        ['A note on this journal', 'This is an original editorial preview, not a health recommendation or a description of an established brand ritual. Brand-reviewed articles and named authors will be added before publication.']
      ]
    },
    {
      slug: 'before-you-choose', title: 'Before you choose a formulation', category: 'Ayurveda, considered', image: 'journal-2.jpg',
      intro: 'A thoughtful choice begins with clear information, not the promise on the front of a bottle.',
      sections: [
        ['Look beyond the product name', 'Before considering a product, look for its complete ingredient list, directions, cautions and approved product details. Those fields remain explicitly pending in this preview.'],
        ['Keep tradition and evidence distinct', 'Historical context can explain where an idea comes from. It cannot, on its own, demonstrate what a particular product will do. Our product pages give traditional context and substantiated information separate places.'],
        ['Take personal questions to a professional', 'Product browsing is not individual medical advice. Discuss Ayurvedic products with a qualified healthcare professional, particularly when using other medicines or managing a health condition. Do not delay medical care.'],
        ['Editorial status', 'Draft for review. This article makes no efficacy claims for Chaulas Wale Hakim Ji products.']
      ]
    },
    {
      slug: 'a-heritage-carefully-recorded', title: 'A heritage, carefully recorded', category: 'From the house', image: 'journal-3.jpg',
      intro: 'A date can begin a story. The people, places and records give it its depth.',
      sections: [
        ['Begin with what we know', 'Chaulas Wale Hakim Ji is a Swastha Ayurveda Pvt. Ltd. brand with heritage dating to 1939. That is the starting point for this digital archive.'],
        ['Leave room for the real story', 'Founder details, family milestones and archival photographs have not yet been supplied. We have deliberately left those chapters open rather than filling them with invented history.'],
        ['The next page', 'The finished archive should bring approved family photographs, dated records and firsthand recollections together. Every image should have a clear caption and every milestone a source.']
      ]
    }
  ],

  faqs: [
    ['Is this a live store?', 'Not yet. This website is a preview of the store. It does not accept payments or create real orders.'],
    ['Are the prices final?', 'No. All displayed prices are demonstration values. Final prices, pack sizes and availability will be confirmed before sale.'],
    ['Where are the ingredients and directions?', 'Those details have not yet been provided. They are marked as pending on every product page, rather than inferred or invented.'],
    ['Are these formulations suitable for me?', 'Suitability has not been verified. This preview does not assess your health or recommend a product. Discuss personal health questions with a qualified healthcare professional.'],
    ['Can I sign in or see my order history?', 'Not in this version. Your bag is kept on this device only. Accounts and real order management are not connected.'],
    ['How do I contact the brand?', 'Verified contact details have not been supplied yet. The Contact page shows the enquiry form, but messages are not delivered.']
  ],

  licences: [
    { title: 'FSSAI licence', status: 'Details to be supplied' },
    { title: 'AYUSH manufacturing licence', status: 'Details to be supplied' }
  ],

  policies: {
    shipping: {
      title: 'Shipping', lede: 'Delivery details, without assumptions.',
      sections: [
        ['Policy awaiting approval', 'Verified delivery regions, fulfilment windows, shipping fees, courier arrangements and serviceability rules are still to be added.'],
        ['In this preview', 'No products are dispatched, no delivery dates are promised and no shipping fees are calculated. The PIN code field in checkout demonstrates the form only.']
      ]
    },
    returns: {
      title: 'Returns', lede: 'Clear expectations belong here.',
      sections: [
        ['Policy awaiting approval', 'Brand-approved return eligibility, cancellation conditions, refund process and timeframes are still to be added.'],
        ['In this preview', 'There is no real purchase, return or refund service. No return window or refund entitlement has been invented.']
      ]
    },
    privacy: {
      title: 'Privacy', lede: 'What this preview does with your information.',
      sections: [
        ['Your bag', 'The contents of your bag and an applied demo code are stored in your browser, on this device only. They are not synced to an account.'],
        ['Forms', 'The newsletter, contact and checkout forms check what you type and then show a confirmation. They do not send or store your details.'],
        ['Third parties', 'This preview loads no tracking, analytics or payment scripts.'],
        ['Before public launch', 'A reviewed privacy notice covering the actual operator, data use, retention, your rights and contact details must replace this explanation.']
      ]
    },
    terms: {
      title: 'Terms', lede: 'A preview, not a sales offer.',
      sections: [
        ['Purpose', 'This website demonstrates the proposed brand and shopping experience. Demo prices are not approved sales offers. Printed details and claims on the packaging images have not been independently verified.'],
        ['No transactions', 'Checkout does not accept payment, create a real order or send a confirmation.'],
        ['Content limitations', 'Health-related product information has not been supplied. Do not use this preview for dosage, suitability, diagnosis, treatment or other medical decisions.'],
        ['Before public launch', 'Reviewed commercial terms, company disclosures and customer-service information must be supplied before the site is used for real sales.']
      ]
    }
  },

  blog: {
    lede: 'Articles on Ayurveda, everyday rituals and the story of the house.'
  },

  /* Our story timeline. Entries with sample: true are placeholders to be replaced with the family's real records. */
  timeline: [
    { year: '1939', title: 'Heritage begins', text: 'The date at the heart of our identity, and the start of the family practice.' },
    { year: '1954', title: 'A growing practice', text: 'A milestone from the early years goes here, such as a first premises or a formulation people came back for.', sample: true },
    { year: '1968', title: 'The next generation', text: 'The year the practice passed to the next generation of the family.', sample: true },
    { year: '1987', title: 'Formulations on record', text: 'A note on how the family formulations were written down and kept.', sample: true },
    { year: '2008', title: 'A wider reach', text: 'A milestone from recent decades goes here, such as new products or new cities served.', sample: true },
    { year: '2026', title: 'A new digital home', text: 'The collection comes online as a Swastha Ayurveda Pvt. Ltd. brand: five formulations and three gift-box designs.' }
  ],

  states: ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']
};

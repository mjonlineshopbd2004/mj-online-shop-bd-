import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'bn' | 'en';

interface Translations {
  [key: string]: {
    bn: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navbar
  home: { bn: 'হোম', en: 'Home' },
  about: { bn: 'আমাদের সম্পর্কে', en: 'About' },
  shop: { bn: 'শপ', en: 'Shop' },
  vendors: { bn: 'ভেন্ডর', en: 'Vendors' },
  contact: { bn: 'যোগাযোগ', en: 'Contact' },
  trackOrder: { bn: 'অর্ডার ট্র্যাক', en: 'Track Order' },
  searchPlaceholder: { bn: 'পণ্য খুঁজুন...', en: 'Search products...' },
  myCart: { bn: 'কার্ট', en: 'My Cart' },
  myList: { bn: 'উইশলিস্ট', en: 'My List' },
  account: { bn: 'অ্যাকাউন্ট', en: 'Account' },
  dashboard: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  allCategories: { bn: 'সব ক্যাটাগরি', en: 'All Categories' },
  trendingProducts: { bn: 'ট্রেন্ডিং পণ্য', en: 'Trending Products' },

  // Home Page
  flashSale: { bn: 'ফ্ল্যাশ সেল', en: 'Flash Sale' },
  viewAll: { bn: 'সব দেখুন', en: 'View All' },
  featuredProducts: { bn: 'সেরা পণ্য', en: 'Featured Products' },
  newArrivals: { bn: 'নতুন পণ্য', en: 'New Arrivals' },
  limitedTimeOffer: { bn: 'সীমিত সময়ের অফার', en: 'Limited Time Offer' },

  // Product
  addToCart: { bn: 'কার্টে যোগ করুন', en: 'Add to Cart' },
  buyNow: { bn: 'সরাসরি অর্ডার', en: 'Buy Now' },
  outOfStock: { bn: 'স্টক শেষ', en: 'Out of Stock' },
  description: { bn: 'বিবরণ', en: 'Description' },
  reviews: { bn: 'রিভিউ', en: 'Reviews' },
  relatedProducts: { bn: 'সম্পর্কিত পণ্য', en: 'Related Products' },
  recentlyViewed: { bn: 'সম্প্রতি দেখা পণ্য', en: 'Recently Viewed' },

  // Cart/Checkout
  orderSummary: { bn: 'অর্ডার সামারি', en: 'Order Summary' },
  subtotal: { bn: 'সাবটোটাল', en: 'Subtotal' },
  shipping: { bn: 'ডেলিভারি চার্জ', en: 'Shipping' },
  total: { bn: 'মোট', en: 'Total' },
  checkout: { bn: 'চেকআউট', en: 'Checkout' },
  placeOrder: { bn: 'অর্ডার সম্পন্ন করুন', en: 'Place Order' },
  shippingInfo: { bn: 'শিপিং তথ্য', en: 'Shipping Information' },
  name: { bn: 'নাম', en: 'Name' },
  phone: { bn: 'ফোন', en: 'Phone' },
  email: { bn: 'ইমেইল', en: 'Email' },
  emergencyNumber: { bn: 'জরুরি ফোন নম্বর', en: 'Emergency Number' },
  district: { bn: 'জেলা', en: 'District' },
  city: { bn: 'শহর', en: 'City' },
  address: { bn: 'ঠিকানা', en: 'Address' },
  selectDistrict: { bn: 'জেলা নির্বাচন করুন', en: 'Select District' },
  enterCity: { bn: 'আপনার শহর লিখুন', en: 'Enter your city' },
  proceedToPayment: { bn: 'পেমেন্ট করুন', en: 'Proceed to Payment' },
  backToCart: { bn: 'কার্টে ফিরে যান', en: 'Back to Cart' },
  payableNow: { bn: 'এখন পরিশোধযোগ্য', en: 'Payable Now' },
  inStock: { bn: 'স্টকে আছে', en: 'In Stock' },
  customerReviews: { bn: 'কাস্টমার রিভিউ', en: 'Customer Reviews' },
  quantity: { bn: 'পরিমাণ', en: 'Quantity' },
  wishlist: { bn: 'উইশলিস্ট', en: 'Wishlist' },
  shareProduct: { bn: 'শেয়ার করুন', en: 'Share this product' },
  copyLink: { bn: 'লিঙ্ক কপি করুন', en: 'Copy Link' },
  colorFamily: { bn: 'কালার ফ্যামিলি', en: 'Color Family' },
  selectColor: { bn: 'কালার নির্বাচন করুন', en: 'Select Color' },
  size: { bn: 'সাইজ', en: 'Size' },
  selectSize: { bn: 'সাইজ নির্বাচন করুন', en: 'Select Size' },
  fastDelivery: { bn: 'দ্রুত ডেলিভারি', en: 'Fast Delivery' },
  acrossBangladesh: { bn: 'সারা বাংলাদেশে', en: 'Across Bangladesh' },
  securePayment: { bn: 'নিরাপদ পেমেন্ট', en: 'Secure Payment' },
  protected100: { bn: '১০০% সুরক্ষিত', en: '100% Protected' },
  easyReturns: { bn: 'সহজ রিটার্ন', en: 'Easy Returns' },
  returnPolicy7Day: { bn: '৭ দিনের রিটার্ন পলিসি', en: '7-Day Return Policy' },
  writeReview: { bn: 'রিভিউ লিখুন', en: 'Write a Review' },
  rating: { bn: 'রেটিং', en: 'Rating' },
  yourComment: { bn: 'আপনার মন্তব্য', en: 'Your Comment' },
  submitReview: { bn: 'রিভিউ জমা দিন', en: 'Submit Review' },
  noReviewsYet: { bn: 'এখনো কোন রিভিউ নেই। প্রথম রিভিউ দিন!', en: 'No reviews yet. Be the first to review this product!' },
  basedOn: { bn: 'ভিত্তিতে', en: 'Based on' },

  // Checkout Specific
  deliveryArea: { bn: 'ডেলিভারি এলাকা', en: 'Delivery Area' },
  paymentType: { bn: 'পেমেন্ট টাইপ', en: 'Payment Type' },
  insideDhaka: { bn: 'ঢাকার ভিতরে', en: 'Inside Dhaka' },
  outsideDhaka: { bn: 'ঢাকার বাইরে', en: 'Outside Dhaka' },
  payNow100: { bn: '১০০% পেমেন্ট করুন', en: 'Pay Now 100%' },
  payFullAmount: { bn: 'পুরো টাকা এখন পরিশোধ করুন', en: 'Pay the full amount now' },
  selectAdvancePayment: { bn: 'নিচের রেঞ্জ থেকে আপনার অগ্রিম পেমেন্ট পার্সেন্ট সিলেক্ট করুন', en: 'Select your advance payment percentage from the range below' },

  // Payment Page
  selectPaymentMethod: { bn: 'পেমেন্ট মেথড নির্বাচন করুন', en: 'Select Payment Method' },
  mobileBanking: { bn: 'মোবাইল ব্যাংকিং', en: 'Mobile Banking' },
  cardPayment: { bn: 'ডেবিট / ক্রেডিট কার্ড', en: 'Debit / Credit Card' },
  invoiceTo: { bn: 'ইনভয়েস টু', en: 'Invoice to' },
  orderId: { bn: 'অর্ডার আইডি', en: 'Order Id' },
  invoiceAmount: { bn: 'ইনভয়েস অ্যামাউন্ট', en: 'Invoice Amount' },
  payNow: { bn: 'পে নাও', en: 'Pay Now' },
  paymentInstructions: { bn: 'পেমেন্ট নির্দেশাবলী', en: 'Payment Instructions' },
  transactionId: { bn: 'ট্রানজেকশন আইডি', en: 'Transaction ID' },
  backToShipping: { bn: 'শিপিং ডিটেইলসে ফিরে যান', en: 'Back to Shipping Details' },
  uploadScreenshot: { bn: 'স্ক্রিনশট আপলোড করুন', en: 'UPLOAD SCREENSHOT' },
  clickToUpload: { bn: 'আপলোড করতে ক্লিক করুন', en: 'Click to upload' },
  sendTo: { bn: 'পাঠান', en: 'Send' },
  via: { bn: 'মাধ্যমে', en: 'via' },
  securePaymentBadge: { bn: 'SSL সুরক্ষিত', en: 'SSL SECURED' },
  pciBadge: { bn: 'PCI DSS কমপ্লায়েন্ট', en: 'PCI DSS COMPLIANT' },
  poweredBy: { bn: 'পাওয়ারড বাই', en: 'Powered by' },

  // Categories
  jewelry: { bn: 'জুয়েলারি', en: 'Jewelry' },
  womensClothing: { bn: 'মেয়েদের পোশাক', en: 'Women\'s Clothing' },
  electronics: { bn: 'ইলেকট্রনিক্স', en: 'Electronics' },
  homeKitchen: { bn: 'হোম ও কিচেন', en: 'Home & Kitchen' },
  watch: { bn: 'ঘড়ি', en: 'Watch' },
  sunglasses: { bn: 'সানগ্লাস', en: 'Sunglasses' },
  phoneAccessories: { bn: 'ফোন এক্সেসরিজ', en: 'Phone Accessories' },
  petsAccessories: { bn: 'পোষা প্রাণীর এক্সেসরিজ', en: 'Pets Accessories' },
  babyItems: { bn: 'বেবি আইটেম', en: 'Baby Items' },
  bags: { bn: 'ব্যাগ', en: 'Bags' },
  shoes: { bn: 'জুতা', en: 'Shoes' },
  watches: { bn: 'ঘড়ি', en: 'Watches' },
  electronicsGadgets: { bn: 'ইলেকট্রনিক্স ও গ্যাজেট', en: 'Electronics & Gadgets' },

  // Districts Mapping (Partial for common ones, can be expanded)
  dhaka: { bn: 'ঢাকা', en: 'Dhaka' },
  chattogram: { bn: 'চট্টগ্রাম', en: 'Chattogram' },
  sylhet: { bn: 'সিলেট', en: 'Sylhet' },
  rajshahi: { bn: 'রাজশাহী', en: 'Rajshahi' },
  khulna: { bn: 'খুলনা', en: 'Khulna' },
  barishal: { bn: 'বরিশাল', en: 'Barishal' },
  rangpur: { bn: 'রংপুর', en: 'Rangpur' },
  mymensingh: { bn: 'ময়মনসিংহ', en: 'Mymensingh' },
  gazipur: { bn: 'গাজীপুর', en: 'Gazipur' },
  narayanganj: { bn: 'নারায়ণগঞ্জ', en: 'Narayanganj' },
  comilla: { bn: 'কুমিল্লা', en: 'Comilla' },
  bogra: { bn: 'বগুড়া', en: 'Bogra' },
  dinajpur: { bn: 'দিনাজপুর', en: 'Dinajpur' },
  feni: { bn: 'ফেনী', en: 'Feni' },
  noakhali: { bn: 'নোয়াখালী', en: 'Noakhali' },
  tangail: { bn: 'টাঙ্গাইল', en: 'Tangail' },
  pabna: { bn: 'পাবনা', en: 'Pabna' },
  kushtia: { bn: 'কুষ্টিয়া', en: 'Kushtia' },
  jashore: { bn: 'যশোর', en: 'Jashore' },
  coxsBazar: { bn: 'কক্সবাজার', en: 'Cox\'s Bazar' },
  
  // Footer
  quickLinks: { bn: 'দ্রুত লিঙ্ক', en: 'Quick Links' },
  customerService: { bn: 'কাস্টমার সার্ভিস', en: 'Customer Service' },
  contactUs: { bn: 'যোগাযোগ করুন', en: 'Contact Us' },
  privacyPolicy: { bn: 'প্রাইভেসি পলিসি', en: 'Privacy Policy' },
  termsConditions: { bn: 'শর্তাবলী', en: 'Terms & Conditions' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateCategory: (category: string) => string;
  translateDistrict: (district: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'bn';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  const translateCategory = (category: string) => {
    if (language === 'en') return category;
    
    const categoryMap: { [key: string]: string } = {
      'Jewelry': 'জুয়েলারি',
      'Women\'s Clothing': 'মেয়েদের পোশাক',
      'Electronics': 'ইলেকট্রনিক্স',
      'Home & Kitchen': 'হোম ও কিচেন',
      'Watch': 'ঘড়ি',
      'Watches': 'ঘড়ি',
      'Sunglasses': 'সানগ্লাস',
      'Phone Accessories': 'ফোন এক্সেসরিজ',
      'Pets Accessories': 'পোষা প্রাণীর এক্সেসরিজ',
      'Baby Items': 'বেবি আইটেম',
      'Bags': 'ব্যাগ',
      'Shoes': 'জুতা',
      'Electronics & Gadgets': 'ইলেকট্রনিক্স ও গ্যাজেট',
      'Accessories': 'এক্সেসরিজ',
      'Women': 'নারী',
      'Men': 'পুরুষ',
      'Imported': 'ইমপোর্টেড',
      'Gadgets': 'গ্যাজেট'
    };

    return categoryMap[category] || category;
  };

  const translateDistrict = (district: string) => {
    if (language === 'en') return district;
    
    const districtMap: { [key: string]: string } = {
      'Bagerhat': 'বাগেরহাট',
      'Bandarban': 'বান্দরবান',
      'Barguna': 'বরগুনা',
      'Barishal': 'বরিশাল',
      'Bhola': 'ভোলা',
      'Bogra': 'বগুড়া',
      'Brahmanbaria': 'ব্রাহ্মণবাড়িয়া',
      'Chandpur': 'চাঁদপুর',
      'Chapai Nawabganj': 'চাঁপাইনবাবগঞ্জ',
      'Chattogram': 'চট্টগ্রাম',
      'Chuadanga': 'চুয়াডাঙ্গা',
      'Comilla': 'কুমিল্লা',
      'Cox\'s Bazar': 'কক্সবাজার',
      'Dhaka': 'ঢাকা',
      'Dinajpur': 'দিনাজপুর',
      'Faridpur': 'ফরিদপুর',
      'Feni': 'ফেনী',
      'Gaibandha': 'গাইবান্ধা',
      'Gazipur': 'গাজীপুর',
      'Gopalganj': 'গোপালগঞ্জ',
      'Habiganj': 'হবিগঞ্জ',
      'Jamalpur': 'জামালপুর',
      'Jashore': 'যশোর',
      'Jhalokati': 'ঝালকাঠি',
      'Jhenaidah': 'ঝিনাইদহ',
      'Joypurhat': 'জয়পুরহাট',
      'Khagrachari': 'খাগড়াছড়ি',
      'Khulna': 'খুলনা',
      'Kishoreganj': 'কিশোরগঞ্জ',
      'Kurigram': 'কুড়িগ্রাম',
      'Kushtia': 'কুষ্টিয়া',
      'Lakshmipur': 'লক্ষ্মীপুর',
      'Lalmonirhat': 'লালমনিরহাট',
      'Madaripur': 'মাদারীপুর',
      'Magura': 'মাগুরা',
      'Manikganj': 'মানিকগঞ্জ',
      'Meherpur': 'মেহেরপুর',
      'Moulvibazar': 'মৌলভীবাজার',
      'Munshiganj': 'মুন্সীগঞ্জ',
      'Mymensingh': 'ময়মনসিংহ',
      'Naogaon': 'নওগাঁ',
      'Narail': 'নড়াইল',
      'Narayanganj': 'নারায়ণগঞ্জ',
      'Narsingdi': 'নরসিংদী',
      'Natore': 'নাটোর',
      'Netrokona': 'নেত্রকোণা',
      'Nilphamari': 'নীলফামারী',
      'Noakhali': 'নোয়াখালী',
      'Pabna': 'পাবনা',
      'Panchagarh': 'পঞ্চগড়',
      'Patuakhali': 'পটুয়াখালী',
      'Pirojpur': 'পিরোজপুর',
      'Rajbari': 'রাজবাড়ী',
      'Rajshahi': 'রাজশাহী',
      'Rangamati': 'রাঙ্গামাটি',
      'Rangpur': 'রংপুর',
      'Satkhira': 'সাতক্ষীরা',
      'Shariatpur': 'শরীয়তপুর',
      'Sherpur': 'শেরপুর',
      'Sirajganj': 'সিরাজগঞ্জ',
      'Sunamganj': 'সুনামগঞ্জ',
      'Sylhet': 'সিলেট',
      'Tangail': 'টাঙ্গাইল',
      'Thakurgaon': 'ঠাকুরগাঁও'
    };

    return districtMap[district] || district;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateCategory, translateDistrict }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

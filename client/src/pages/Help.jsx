import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { HelpCircle, ChevronDown, ChevronUp, Phone, Mail, MapPin } from 'lucide-react';

export default function Help() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "How do I report a problem?",
      a: "Click on 'Report Issue' from the home page. Select the category of your problem, provide a description (you can use text or voice), pinpoint the location on the map, upload photos if you have them, and submit."
    },
    {
      q: "What types of issues can I report?",
      a: "You can report civic issues like broken roads, water supply problems, blocked drainage, non-functioning streetlights, garbage accumulation, and public transport complaints."
    },
    {
      q: "How is my complaint prioritized?",
      a: "Our AI system analyzes the content of your complaint and automatically assigns a priority (Critical, High, Medium, Low) based on the severity, potential hazard, and number of people affected."
    },
    {
      q: "Can I report in Tamil?",
      a: "Yes! You can type your description in Tamil or use the voice input feature to speak in Tamil. Our system will automatically process and translate it for the officials."
    },
    {
      q: "How long does resolution take?",
      a: "Resolution times vary by category and priority. Minor issues like streetlights may be fixed in 2-3 days, while major road works might take weeks. An expected timeframe will be provided after analysis."
    },
    {
      q: "What happens after I submit?",
      a: "Your complaint is analyzed by AI, routed to the exact concerned department, and officials are notified. You will receive updates as the status changes from Assigned to In Progress to Resolved."
    },
    {
      q: "How do I verify resolution?",
      a: "Once the department marks an issue as 'Resolved', you will see an option in your dashboard to verify it. If the work is incomplete, you can select 'No' and it will be reopened for review."
    },
    {
      q: "Is my personal information safe?",
      a: "Yes, your contact details are only visible to verified officials working on your issue. They are not displayed publicly on the dashboard."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('help.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Find answers to common questions or reach out to our support team for assistance.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12">
        <h2 className="text-xl font-bold bg-gray-50 border-b border-gray-200 px-6 py-4 text-gray-800">
          {t('help.faq')}
        </h2>
        <div className="divide-y divide-gray-100">
          {faqs.map((faq, index) => (
            <div key={index} className="px-6 py-4">
              <button 
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <span className="font-medium text-gray-900">{faq.q}</span>
                {openFaq === index ? (
                  <ChevronUp size={20} className="text-gray-500 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500 flex-shrink-0 ml-4" />
                )}
              </button>
              {openFaq === index && (
                <div className="mt-3 text-gray-600 pr-8">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('help.contact')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow">
            <Phone className="mx-auto text-blue-600 mb-3" size={28} />
            <h3 className="font-semibold text-gray-900 mb-1">Helpline</h3>
            <p className="text-gray-600 text-sm mb-3">Toll-free, 24/7 support</p>
            <a href="tel:104" className="text-lg font-bold text-blue-600">104</a>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow">
            <Mail className="mx-auto text-blue-600 mb-3" size={28} />
            <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
            <p className="text-gray-600 text-sm mb-3">For general inquiries</p>
            <a href="mailto:support@citizen.gov.in" className="text-sm font-medium text-blue-600">support@citizen.gov.in</a>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-md transition-shadow">
            <MapPin className="mx-auto text-blue-600 mb-3" size={28} />
            <h3 className="font-semibold text-gray-900 mb-1">Office</h3>
            <p className="text-gray-600 text-sm mb-3">Constituency HQ</p>
            <span className="text-sm font-medium text-gray-800">123 Main Road, City Center</span>
          </div>
        </div>
      </div>
    </div>
  );
}

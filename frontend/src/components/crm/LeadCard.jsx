import React, { useState } from 'react';
import { Mail, Phone, Copy, ExternalLink, User, Building2, GraduationCap, Clock, MessageSquare } from 'lucide-react';
import { formatDateSmart, detectDateField } from '../../utils/dateUtils';

const LeadCard = ({ lead, source }) => {
  const [copied, setCopied] = useState(null);

  const dateField = detectDateField(lead);
  const leadDate = lead[dateField];

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getSourceColor = (source) => {
    const colorMap = {
      'customers': 'blue',
      'customerads': 'green',
      'googlecustomerads': 'orange',
      'enquiries': 'purple',
      'consultads': 'pink'
    };
    return colorMap[source.toLowerCase()] || 'gray';
  };

  const sourceColor = getSourceColor(source);
  const sourceColorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
    pink: 'bg-pink-100 text-pink-700',
    gray: 'bg-gray-100 text-gray-700'
  };

  const phone = lead.phoneNumber || lead.phone;
  const email = lead.email;
  const name = lead.name;
  const message = lead.message;
  const college = lead.college;
  const year = lead.year;
  const department = lead.department;

  const openWhatsApp = () => {
    if (phone) {
      const cleanPhone = phone.toString().replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
            <User size={20} className="text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">{name || 'No Name'}</h3>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${sourceColorClasses[sourceColor]}`}>
          {source}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {email && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail size={14} className="flex-shrink-0" />
            <span className="truncate flex-1">{email}</span>
            <button
              onClick={() => copyToClipboard(email, 'email')}
              className="text-blue-600 hover:text-blue-700 flex-shrink-0"
              title="Copy email"
            >
              {copied === 'email' ? '✓' : <Copy size={14} />}
            </button>
          </div>
        )}
        {phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone size={14} className="flex-shrink-0" />
            <span className="flex-1">{phone}</span>
            <button
              onClick={() => copyToClipboard(phone.toString(), 'phone')}
              className="text-blue-600 hover:text-blue-700 flex-shrink-0"
              title="Copy phone"
            >
              {copied === 'phone' ? '✓' : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <MessageSquare size={14} className="text-gray-500 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-700 line-clamp-3">{message}</p>
          </div>
        </div>
      )}

      {/* Student Details */}
      {(college || year || department) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {college && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded text-xs text-blue-700">
              <Building2 size={12} />
              <span className="truncate max-w-[150px]">{college}</span>
            </div>
          )}
          {year && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded text-xs text-green-700">
              <GraduationCap size={12} />
              <span>{year}</span>
            </div>
          )}
          {department && (
            <div className="px-2 py-1 bg-purple-50 rounded text-xs text-purple-700 truncate max-w-[120px]">
              {department}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock size={12} />
          <span>{leadDate ? formatDateSmart(leadDate) : 'No date'}</span>
        </div>
        <div className="flex items-center space-x-2">
          {email && (
            <a
              href={`mailto:${email}`}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Send email"
            >
              <Mail size={16} />
            </a>
          )}
          {phone && (
            <button
              onClick={openWhatsApp}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Open WhatsApp"
            >
              <ExternalLink size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadCard;

"use client";

import { useEffect, useState } from "react";

export default function WhatsAppWidget() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show widget after page loads
    setIsVisible(true);
  }, []);

  const whatsappNumber = "918087131777";
  const whatsappMessage = "Hello Enromatics, I want to know more about your Institute Managemnt System";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  if (!isVisible) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-bounce"
      aria-label="Chat on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      {/* WhatsApp Icon */}
      <svg
        className="w-7 h-7"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.452 0-2.83.457-3.957 1.318-.99.704-1.708 1.642-2.146 2.834-.437 1.192-.656 2.544-.656 3.844 0 1.29.22 2.646.66 3.841.44 1.194 1.164 2.141 2.158 2.846 1.14.873 2.53 1.34 3.991 1.34h.004c1.45 0 2.83-.467 3.955-1.33.989-.706 1.707-1.648 2.144-2.839.437-1.192.657-2.544.657-3.845 0-1.3-.22-2.660-.66-3.854-.44-1.194-1.163-2.14-2.157-2.844-1.14-.872-2.529-1.34-3.991-1.34zm0-2.382c1.99 0 3.847.486 5.39 1.409.923.564 1.726 1.323 2.394 2.247.667.924 1.178 1.996 1.513 3.178.335 1.182.504 2.506.504 3.906 0 1.391-.17 2.714-.504 3.894-.335 1.181-.846 2.252-1.513 3.175-.668.924-1.471 1.684-2.394 2.248-1.543.924-3.4 1.41-5.39 1.41-1.99 0-3.847-.486-5.39-1.41-.923-.564-1.726-1.324-2.394-2.248-.667-.923-1.178-1.994-1.513-3.175-.335-1.18-.504-2.503-.504-3.894 0-1.4.169-2.724.504-3.906.335-1.182.846-2.254 1.513-3.178.668-.924 1.471-1.683 2.394-2.247 1.543-.923 3.4-1.409 5.39-1.409z" />
      </svg>
    </a>
  );
}

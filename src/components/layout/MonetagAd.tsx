import { useEffect } from 'react';

const MonetagAd = () => {
  useEffect(() => {
    // Create the script element
    const script = document.createElement('script');
    
    // Example: Replace this URL with your actual Monetag zone tag script source
    script.src = 'https://n6wxm.com/vignette.min.js'; 
    script.async = true;
    
    // Set your unique Monetag zone configuration data attributes
    script.setAttribute('data-zone', '11173359'); // Replace with your Zone ID
    
    // Append the script securely to the document body or a wrapper element
    document.body.appendChild(script);

    // Clean up function to remove the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="ad-container">
      {/* Some Monetag formats require an explicit target div container */}
      <div id="monetag-ad-zone"></div>
    </div>
  );
};

export default MonetagAd;

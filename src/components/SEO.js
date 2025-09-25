// components/SEO.js
import React from "react";
import { Helmet } from "react-helmet";

const SEO = ({
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
  schema, // ✅ Pass any JSON-LD schema
}) => {
  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title} | Lion Bidi</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Social */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* ✅ JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

import React, { useEffect } from 'react';

/**
 * Componente SEO para gestionar metadatos de forma dinámica.
 * Dado que el proyecto no parece usar react-helmet, usaremos un efecto para actualizar el DOM.
 */
const SEO = ({
    title,
    description,
    canonical,
    ogType = 'website',
    ogImage = 'https://doctoraecos.com/logo-og.png', // Imagen por defecto
    keywords = 'ecografías Valencia, eco doppler Carabobo, ultrasonido Venezuela 2026, DoctoraEcos, Dra Jeremmy Gutierrez, centro ecografías La Viña',
    schema // Objeto JSON-LD
}) => {
    const siteName = "DoctoraEcos | Dra. Jeremmy Gutierrez";
    const fullTitle = title ? `${title} | ${siteName}` : siteName;

    useEffect(() => {
        // Actualizar Título
        document.title = fullTitle;

        // Actualizar Meta Description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description);
        } else {
            metaDescription = document.createElement('meta');
            metaDescription.name = "description";
            metaDescription.content = description;
            document.head.appendChild(metaDescription);
        }

        // Actualizar Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute('content', keywords);
        } else {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = "keywords";
            metaKeywords.content = keywords;
            document.head.appendChild(metaKeywords);
        }

        // Canonical
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (linkCanonical) {
            linkCanonical.setAttribute('href', canonical || window.location.href);
        } else {
            linkCanonical = document.createElement('link');
            linkCanonical.rel = "canonical";
            linkCanonical.href = canonical || window.location.href;
            document.head.appendChild(linkCanonical);
        }

        // Open Graph
        const updateOgMeta = (property, content) => {
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (meta) {
                meta.setAttribute('content', content);
            } else {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                meta.content = content;
                document.head.appendChild(meta);
            }
        };

        updateOgMeta('og:title', fullTitle);
        updateOgMeta('og:description', description);
        updateOgMeta('og:type', ogType);
        updateOgMeta('og:url', window.location.href);
        updateOgMeta('og:image', ogImage);
        updateOgMeta('og:site_name', siteName);

        // Twitter Cards
        const updateTwitterMeta = (name, content) => {
            let meta = document.querySelector(`meta[name="${name}"]`);
            if (meta) {
                meta.setAttribute('content', content);
            } else {
                meta = document.createElement('meta');
                meta.name = name;
                meta.content = content;
                document.head.appendChild(meta);
            }
        };

        updateTwitterMeta('twitter:card', 'summary_large_image');
        updateTwitterMeta('twitter:title', fullTitle);
        updateTwitterMeta('twitter:description', description);
        updateTwitterMeta('twitter:image', ogImage);

        // Schema JSON-LD
        let scriptSchema = document.querySelector('script[id="json-ld-schema"]');
        if (schema) {
            if (scriptSchema) {
                scriptSchema.text = JSON.stringify(schema);
            } else {
                scriptSchema = document.createElement('script');
                scriptSchema.id = 'json-ld-schema';
                scriptSchema.type = 'application/ld+json';
                scriptSchema.text = JSON.stringify(schema);
                document.head.appendChild(scriptSchema);
            }
        } else if (scriptSchema) {
            scriptSchema.remove();
        }

    }, [fullTitle, description, canonical, ogType, ogImage, keywords, schema]);

    return null; // Este componente no renderiza nada visible
};

export default SEO;

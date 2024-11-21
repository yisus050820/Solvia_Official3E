import { useEffect } from 'react';

const WeglotLoader = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdn.weglot.com/weglot.min.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            window.Weglot.initialize({
                api_key: 'wg_ca70ea56738f5c8723d7e4dd36b8b1f56',
            });
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return null;
};

export default WeglotLoader;

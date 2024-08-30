import { useEffect, useRef } from 'react';

const useIntersectionObserver = (onIntersect, options = {}) => {
    const elementsRef = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    onIntersect(entry, true);
                } else {
                    onIntersect(entry, false);
                }
            });
        }, options);

        elementsRef.current.forEach(el => {
            if (el) {
                observer.observe(el);
            }
        });

        return () => {
            elementsRef.current.forEach(el => {
                if (el) {
                    observer.unobserve(el);
                }
            });
        };
    }, [onIntersect, options]);

    return elementsRef;
};

export default useIntersectionObserver;
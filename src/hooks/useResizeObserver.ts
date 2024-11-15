import { RefObject, useEffect, useState } from "react";

const useResizeObserver = (ref: RefObject<HTMLElement>) => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (ref.current) {
        setDimensions({
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight,
        });
      }
    };

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    updateDimensions();

    return () => observer.disconnect();
  }, [ref]);

  return dimensions;
};

export default useResizeObserver;

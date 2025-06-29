import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import move from "lodash-move";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

const INITIAL_CARDS = [
  { color: "#266678", label: "Design Sprint" },
  { color: "#cb7c7a", label: "UX Workshop" },
  { color: "#36a18b", label: "Prototype Phase" },
  { color: "#cda35f", label: "User Testing" },
  { color: "#747474", label: "Launch Prep" },
  { color: "#0000FF", label: "Launch" },
];

const CARD_OFFSET = 10;
const SCALE_FACTOR = 0.06;
const MAX_ROTATION = 10;
const SWIPE_THRESHOLD = 100;
const AUTOPLAY_INTERVAL = 2000;

export default function CardSlider() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [isHovered, setIsHovered] = useState(false);
  const [fadeCardIndex, setFadeCardIndex] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (cards.length === 0) {
      const timeout = setTimeout(() => setCards(INITIAL_CARDS), 500);
      return () => clearTimeout(timeout);
    }
  }, [cards]);

  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(
        () => triggerFadeOut(0),
        AUTOPLAY_INTERVAL
      );
    }
    return () => clearInterval(intervalRef.current);
  }, [isHovered, cards]);

  const triggerFadeOut = (index) => {
    setFadeCardIndex(index);
    setTimeout(() => moveToEnd(index), 300);
  };

  const moveToEnd = (index) => {
    const updated = move(cards, index, cards.length - 1).slice(
      0,
      cards.length - 1
    );
    setCards(updated);
    setFadeCardIndex(null);
  };

  const handlePrev = () => {
    if (cards.length < INITIAL_CARDS.length) {
      const swipedCards = INITIAL_CARDS.filter((card) => !cards.includes(card));
      const lastSwipedCard = swipedCards[swipedCards.length - 1];
      setCards([lastSwipedCard, ...cards]);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  };

  const getCardRotation = (index) => {
    const direction = index % 2 === 0 ? 1 : -1;
    return direction * (Math.random() * MAX_ROTATION);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-10 py-10 relative">
        <div className="absolute top-10 left-0 flex flex-col gap-3 pl-4">
          <button
            onClick={handlePrev}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-200"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => triggerFadeOut(0)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-200"
          >
            <ChevronRight />
          </button>
          <button
            onClick={handleShuffle}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-200"
          >
            <Shuffle />
          </button>
        </div>
        {cards[0]?.label && (
          <p className="text-4xl md:text-6xl font-extrabold leading-tight text-black mb-6">
            → {cards[0].label}
          </p>
        )}
      </div>

      {/* Right Panel - Cards */}
      <div
        className="w-full md:w-1/2 flex items-center justify-center relative py-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ul className="relative w-[500px] h-[500px]">
          <AnimatePresence>
            {cards.map((card, index) => {
              const canDrag = index === 0;
              const isFading = index === fadeCardIndex;

              return (
                <motion.li
                  key={`${card.color}-${index}`}
                  className="absolute w-full h-full rounded-2xl shadow-xl list-none flex items-end p-6"
                  style={{
                    backgroundColor: card.color,
                    cursor: canDrag ? "grab" : "default",
                  }}
                  initial={{ opacity: 1, x: 0 }}
                  animate={{
                    left: index * -CARD_OFFSET,
                    scale: 1 - index * SCALE_FACTOR,
                    zIndex: cards.length - index,
                    opacity: isFading ? 0 : 1,
                    x: isFading ? 100 : 0,
                    rotate: getCardRotation(index),
                    transition: isFading
                      ? { duration: 0.3, ease: "easeInOut" }
                      : {},
                  }}
                  exit={{ opacity: 0 }}
                  drag={canDrag ? "x" : false}
                  dragConstraints={false}
                  onDragEnd={(e, info) => {
                    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
                      moveToEnd(index);
                    }
                  }}
                />
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}

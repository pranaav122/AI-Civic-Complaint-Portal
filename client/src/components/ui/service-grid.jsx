import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const ServiceGrid = React.forwardRef(
  ({ title, subtitle, services, className, onServiceClick, ...props }, ref) => {
    // Animation variants for the container to orchestrate children animations
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1, // Stagger the animation of children by 0.1s
        },
      },
    };

    // Animation variants for each grid item
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 10,
        },
      },
    };

    return (
      <section
        ref={ref}
        className={cn("w-full py-12 md:py-16 lg:py-20", className)}
        {...props}
      >
        <div className="container mx-auto px-4 md:px-6">
          {/* Header Section */}
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 md:mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900">
                {title}
              </h2>
              {subtitle && (
                <p className="max-w-[700px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Animated Grid Section */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {services.map((service, index) => (
              <motion.button
                key={index}
                onClick={() => onServiceClick && onServiceClick(service.id)}
                className="group flex flex-col items-center justify-start gap-3 text-center cursor-pointer bg-transparent border-none p-0 m-0"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }} // Hover animation
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <div className="flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:border-civic-200 transition-colors">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={`${service.name} service`}
                      width={100}
                      height={100}
                      className="object-cover w-full h-full rounded-2xl transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : service.icon ? (
                    <service.icon size={48} className={cn("transition-transform duration-300 group-hover:scale-110 group-hover:text-civic-600", service.color || "text-slate-600")} />
                  ) : null}
                </div>
                <span className="text-sm font-medium text-slate-800 transition-colors duration-300 group-hover:text-civic-700">
                  {service.name}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }
);

ServiceGrid.displayName = "ServiceGrid";

export { ServiceGrid };

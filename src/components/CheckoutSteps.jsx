import { Check, ShoppingCart, CreditCard, Truck } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CheckoutSteps = ({ currentStep }) => {
    const steps = [
        { id: 1, name: 'Cart', icon: ShoppingCart },
        { id: 2, name: 'Checkout', icon: CreditCard }, // Combined Address + Payment for now based on file structure
        { id: 3, name: 'Done', icon: Truck },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto mb-12">
            <div className="relative flex justify-between items-center">
                {/* Connecting Lines */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div 
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                    isCompleted ? "bg-blue-600 border-blue-600 text-white" : 
                                    isCurrent ? "bg-white border-blue-600 text-blue-600 shadow-lg scale-110" : 
                                    "bg-white border-gray-300 text-gray-400"
                                )}
                            >
                                {isCompleted ? <Check className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                            </div>
                            <span className={cn(
                                "text-sm font-semibold transition-colors duration-300",
                                isCurrent ? "text-blue-600" : isCompleted ? "text-gray-800" : "text-gray-400"
                            )}>
                                {step.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CheckoutSteps;

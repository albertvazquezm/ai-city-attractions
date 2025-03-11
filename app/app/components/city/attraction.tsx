
interface AttractionProps {
    position: number;
    name: string;
    description: string;
    address: string;
}

export const Attraction = ({ position, name, description, address }: AttractionProps) => {
    return (
        <div className="flex gap-6">
            <div className="w-14 flex-none">
                <span className="text-4xl font-bold text-gray-300">{position}</span>
            </div>
            <div>
                <h3 className="text-2xl font-bold mb-2">{name}</h3>
                <p className="text-gray-600 mb-3">
                    {description}
                </p>
                {address && <p className="text-sm text-gray-500">
                    {address}
                </p>}
            </div>
        </div>
    );
};

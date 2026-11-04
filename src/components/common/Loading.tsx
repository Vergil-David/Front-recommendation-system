type LoadingProps = {
  text?: string;
};

export function Loading({ text = "Завантаження..." }: LoadingProps) {
  return <p className="text-sm text-gray-500">{text}</p>;
}

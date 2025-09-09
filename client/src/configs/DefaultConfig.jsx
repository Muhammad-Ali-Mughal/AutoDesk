function DefaultConfig({ node }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{node?.label}</h3>
      <p className="text-sm text-gray-600">
        Configure settings for {node?.label}.
      </p>
    </div>
  );
}

export default DefaultConfig;
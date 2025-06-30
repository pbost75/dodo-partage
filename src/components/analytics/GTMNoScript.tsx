interface GTMNoScriptProps {
  gtmId: string;
}

const GTMNoScript: React.FC<GTMNoScriptProps> = ({ gtmId }) => {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
};

export default GTMNoScript; 
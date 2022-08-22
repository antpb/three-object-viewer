import P2PCF from './p2pcf/p2pcf.js';

const Networking = (props) => {
    if (!document.location.hash) {
        document.location =
          document.location.toString() +
          `#xpp-${props.postSlug}`
      }
      
    const p2pcf = new P2PCF(
        'user-' + Math.floor(Math.random() * 100000),
        document.location.hash.substring(1)
      )
    window.p2pcf = p2pcf
    console.log(p2pcf);
      
	return (
    <>
    </>
    );
};

export default Networking;

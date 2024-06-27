import  { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import "./Success.css"
const Success = () => {
  const location = useLocation();
  const { videoURL } = location.state || {};
  useEffect(()=> {
    console.log(videoURL)
  },[])
  return (
    <div
    
      style={{backgroundColor: "black", overflow: "hidden", height: "100vh", width: "100vw"}}
    >
      <div style={{padding: 16, height: "20%", width: "100%"}}><h1>Verificação de Biometria</h1></div>
      <div style={{height: "80%", width: "100%", display: "flex",   justifyContent: "center", alignItems: "flex-start"}}>
      
        <div style={{backgroundColor: "#1a1a1a", border: "1px solid #555",borderRadius: 16,padding: "0px 16px",width: "80%",}}>
          <div style={{borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between"}}>

          <h2>Biometria id: 090</h2>
          
          </div>
          <p style={{color: "gray", fontSize: 14}}>ID Compra: 3089493849--3084209-asdasdas</p>

          <p
           style={{color: "gray", fontSize: 14}}
          >
            Hora da Requição: 10:00:00
          </p>
         
          <div style={{ marginTop: 24,}}>
          <div style={{display: "flex", padding: "0px 8px", backgroundColor: "#ccaa2255", border: "1px solid #aaaa22", justifyContent: "space-between", alignItems: "center", borderRadius: 8}}>
          <div style={{display: "flex", flexDirection: "row", alignItems: "center",gap: 8, flexWrap: "nowrap"}}>
            <div className="spinner">
              <div></div>
              <div></div>
                <div></div>
                <div></div>
                </div>
          <p style={{fontWeight: 600, color:  "#aaaa22"}}>Aguardando Verificação</p>
          </div>
          {videoURL && (
          <div
          style={{ width: 60,  display: "flex", justifyContent: "center", alignItems: "center",   }}
          >
          <video src={videoURL}autoPlay loop style={{ width: '100%', borderRadius: "12", overflow: "hidden"  }} />
        </div>
      
        )}
          </div>
         
          {/* <div className='loading-bar'></div> */}
        <div style={{display: "flex", padding: "16px 0px"}}>
        
       
        <button>Cancel</button>
        <button disabled>
            Escolher método de pagamento
        </button>
        {/* <p>Failed message</p>
        <button>Retry</button> */}
          </div>
        </div>
      
        
        </div>
          
      
      </div>
    </div>
  );
};

export default Success;
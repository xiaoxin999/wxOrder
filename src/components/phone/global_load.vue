<template>
  <div id='global_loader'>
      <div class="lds-spinner">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
  </div>
</template>

<script>
    
</script>

<style scoped lang='less'>
    
    
@size: 1.8rem;
@thickness: 0.4rem;

@lat: (@size - @thickness) / 2;
@offset: @lat - @thickness;



#global_loader {
  position: fixed;
  top:0;
  left:0;
  background-color: rgba(0,0,0,0.2);
  width: 100%;
  height: 100%;
  z-index:200;


  .lds-spinner {
      color: #fff;
      width: 64px;
      height: 64px;
      background-color: rgba(0,0,0,0.3);
      border-radius: 5px;
      transform: scale(0.6);
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      margin: auto;
    }
    
    .lds-spinner div {
      transform-origin: 32px 32px;
      animation: lds-spinner 1.2s linear infinite;
    }
    
    .lds-spinner div:after {
      content: " ";
      display: block;
      position: absolute;
      top: 3px;
      left: 29px;
      width: 5px;
      height: 14px;
      border-radius: 20%;
      background: #fff;
    }
    
    .lds-spinner div:nth-child(1) {
      transform: rotate(0deg);
      animation-delay: -1.1s;
    }
    
    .lds-spinner div:nth-child(2) {
      transform: rotate(30deg);
      animation-delay: -1s;
    }
    
    .lds-spinner div:nth-child(3) {
      transform: rotate(60deg);
      animation-delay: -0.9s;
    }
    
    .lds-spinner div:nth-child(4) {
      transform: rotate(90deg);
      animation-delay: -0.8s;
    }
    
    .lds-spinner div:nth-child(5) {
      transform: rotate(120deg);
      animation-delay: -0.7s;
    }
    
    .lds-spinner div:nth-child(6) {
      transform: rotate(150deg);
      animation-delay: -0.6s;
    }
    
    .lds-spinner div:nth-child(7) {
      transform: rotate(180deg);
      animation-delay: -0.5s;
    }
    
    .lds-spinner div:nth-child(8) {
      transform: rotate(210deg);
      animation-delay: -0.4s;
    }
    
    .lds-spinner div:nth-child(9) {
      transform: rotate(240deg);
      animation-delay: -0.3s;
    }
    
    .lds-spinner div:nth-child(10) {
      transform: rotate(270deg);
      animation-delay: -0.2s;
    }
    
    .lds-spinner div:nth-child(11) {
      transform: rotate(300deg);
      animation-delay: -0.1s;
    }
    
    .lds-spinner div:nth-child(12) {
      transform: rotate(330deg);
      animation-delay: 0s;
    }
    
    @keyframes lds-spinner {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
}
</style>

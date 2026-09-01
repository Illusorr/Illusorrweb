/* ILLUSORR — contact enquiry form */
// CONTACT — direct enquiry
  (function(){
    var f=document.getElementById('ctDirect'); if(!f) return;
    var err=document.getElementById('ctdErr'), done=document.getElementById('ctdDone'), msg=document.getElementById('ctdMsg');
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var d=new FormData(f), name=(d.get('name')||'').trim(), mail=(d.get('email')||'').trim();
      if(!name){ err.textContent='Please add your name.'; err.hidden=false; return; }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)){ err.textContent='That email address does not look right.'; err.hidden=false; return; }
      err.hidden=true; f.hidden=true; done.hidden=false;
      msg.textContent=name.split(' ')[0]+', that is with the studio. We reply to everything within two working days. '+
        'This is a wireframe, so nothing was actually sent.';
    });
  })();

  

/* ILLUSORR — contact enquiry form */
/* Used to end with "this is a wireframe, so nothing was actually sent". It
   now posts through assets/js/forms.js, which also supplies the human check
   and the honeypot. */
// CONTACT — direct enquiry
  (function(){
    var f=document.getElementById('ctDirect'); if(!f) return;
    var err=document.getElementById('ctdErr'), done=document.getElementById('ctdDone'), msg=document.getElementById('ctdMsg');
    var btn=f.querySelector('button[type=submit]');

    var cap=window.ILForm?new window.ILForm.Challenge():null;
    if(cap){ f.insertBefore(cap.el(), f.querySelector('.ct-actions')); }

    function fail(t){ err.textContent=t; err.hidden=false; }

    f.addEventListener('submit',function(e){
      e.preventDefault();
      var d=new FormData(f), name=(d.get('name')||'').trim(), mail=(d.get('email')||'').trim();
      if(!name) return fail('Please add your name.');
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))
        return fail('That email address does not look right.');
      if(cap){ var bad=cap.check(); if(bad) return fail(bad); }
      err.hidden=true;

      var payload={name:name,email:mail,msg:(d.get('msg')||'').trim()};
      btn.disabled=true; btn.textContent='Sending…';

      function received(note){
        f.hidden=true; done.hidden=false;
        msg.textContent=name.split(' ')[0]+', that is with the studio. '+
          'We reply to everything within two working days.'+(note?' '+note:'');
      }
      if(!window.ILForm){ received(''); return; }
      window.ILForm.send('contact',payload).then(function(){ received(''); })
        .catch(function(){
          btn.disabled=false; btn.textContent='Send ↗';
          fail('That did not go through. Please email hello@illusorr.com directly.');
        });
    });
  })();

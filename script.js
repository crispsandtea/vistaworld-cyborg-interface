// Blue orb cursor that follows mouse
   const cursor = document.createElement('div');
   cursor.style.cssText = 'position: fixed; width: 20px; height: 20px; background: #0088ff; border-radius: 50%; pointer-events: none; z-index: 9999; box-shadow: 0 0 20px #0088ff;';
   document.body.appendChild(cursor);
   
   document.addEventListener('mousemove', e => {
     cursor.style.left = e.clientX - 10 + 'px';
     cursor.style.top = e.clientY - 10 + 'px';
   });
$(function(){
    var finished = false;

    $('#t').t({
        delay: 2,                   // Start delay in seconds
        speed: 50,                  // Typing speed (ms per character)
        speed_vary: false,          // Disable automatic speed variation (we use inline <s> tags)
        beep: true,                 // Enable beep while typing (if supported)
        locale: 'en',               // English layout
        caret: '\u2589',            // Caret character
        blink: true,                // Enable caret blinking
        blink_perm: false,          // Caret blinks only during delay/pause/finish
        repeat: 0,                  // No repeat
        tag: 'span',                // Use <span> tags for typed content
        pause_on_tab_switch: true,  // Pause when tab is inactive
        pause_on_click: false,

        fin: function(){
            if (!finished) {
                finished = true;
                $('#skip').hide();
                $('#t').fadeOut(3000, function(){
                    $('#logo').fadeIn(2000, function(){
                        $('#next').fadeIn(2000);
                    });
                });
            }
        }
    });

    $('#skip').click(function(){
        $('#skip').hide();
        $('#t').t_off(true);
        $('#t').fadeOut(300, function(){
            $('#logo').fadeIn(300, function(){
                $('#next').fadeIn(300);
            });
        });
    });
});

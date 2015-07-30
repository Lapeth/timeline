from webassets import Bundle, register

webclientjs = Bundle('static/js/01_Item.js', 'static/js/02.Control.js', 'static/js/03.Util.js', 'static/js/04.Time.js',
            'static/js/Event.js', 'static/js/Tag.js',
            filters='jsmin', output='webclient.js')
register('webclientjs', js)
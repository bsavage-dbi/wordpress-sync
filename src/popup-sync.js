(function()
{
    var status = document.querySelector('pre'), log = function(message, timeout, color)
    {
        return setTimeout(function()
        {
            status.innerHTML += '<span style="color:' + (color||'blue') + '">' + ( new Date ).toLocaleString() + ' - ' + message + '</span>\n'
        }, timeout||500)
    }, XHR = function(url, data, then, err)
    {
        var http = new XMLHttpRequest
        http.open('POST', url, true)
        http.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
        http.onreadystatechange = function()
        {
            if ( http.readyState == 4 && http.status == 200 ) {
                try { then(JSON.parse(http.responseText)) } catch (e){ then(http.responseText) }
            } else if ( http.readyState == 4 ) {
                err && err( http )
            }
        }
        http.send(JSON.stringify(data))
    }

    log('Sync started', 1)
    log('Loading data..')

    chrome.storage.sync.get('pairs', function(pairs)
    {
        pairs = pairs ? pairs.pairs : []
        log('Loaded ' + pairs.length + ' pairs of data.')
        log('Loading settings..')

        var returns = 0

        chrome.storage.sync.get('key', function(key)
        {
            key = key ? key.key : null

            if ( ! key ) {
                log( 'Could not load an authentication key, please update your settings and try again.', null, 'red' )
                log( 'Sync has stopped due to an error.' )
            } else {
                chrome.storage.sync.get('websites', function(websites)
                {
                    websites = websites ? websites.websites : []

                    if ( ! key ) {
                        log( 'No websites were loaded. Please add your websites in the settings and retry.', null, 'red' )
                        log( 'Sync has stopped due to an error.' )
                    } else {
                        log('Settings loaded, begin sync.')

                        websites.forEach(function(website)
                        {
                            var url = website.replace(/\/{1,}$/g, '') + '/wp-admin/admin-ajax.php'
                            log('Contacting ' + website + ' (' + url + ')...')

                            XHR(url + '?action=synced_wordpress_widget_sync', {
                                data: pairs,
                                key: key
                            }, function(res)
                            {
                                log( 'Sync successful for ' + website + '</span>', null, 'green' ) && ++returns
                                returns === websites.length && log('Sync has finished.')
                            }, function(http)
                            {
                                log( 'Sync for ' + website + ' ended with an error: ' + http.statusText, null, 'red' ) && ++returns
                                returns === websites.length && log('Sync has finished.')
                            })
                        })
                    }
                })
            }
        })
    })
})()
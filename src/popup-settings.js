(function()
{
    var mid, status = document.getElementById('status'), message = function(t)
    {
        mid && clearTimeout(mid)
        status.textContent = t
        mid = setTimeout(function()
        {
            status.textContent = ''   
        }, 2000)

        return true
    }
    
    document.forms[0].removeAttribute('onsubmit')
    document.forms[0].addEventListener('submit', function(e)
    {
        e.preventDefault()

        var key = document.getElementById('key')
          , websites = document.getElementById('websites')
          , urls = []

        key.value.trim() || key.focus()
        key.value.trim() && message('Changes saved.') && chrome.storage.sync.set({ key: key.value.trim() })

        urls = websites.value.split('\n')

        if ( urls.length ) {
            urls = urls.map(function(url)
            {
                if ( ! /^https?:\/\/.{1,}$/.test( url ) )
                    return

                return url
            }).filter(Boolean)
            
            urls = urls.filter(function(x, i, self)
            {
                return self.indexOf(x) === i
            })
        }

        urls.length && ( websites.value = urls.join('\n') ) || websites.focus()
        urls.length && message('Changes saved.') && chrome.storage.sync.set({ websites: urls })
    })

    chrome.storage.sync.get('key', function(data)
    {
        document.getElementById('key').value = data.key ? data.key : ''
    })

    chrome.storage.sync.get('websites', function(data)
    {
        document.getElementById('websites').value = data.websites ? data.websites.join('\n') : ''
    })

})()
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
    }, form = document.forms[0], cont = form.children[0], remove = function(e)
    {
        e.preventDefault()

        var container = this.parentElement.parentElement

        if ( cont.childElementCount > 1 ) {
            container.remove()
        } else {
            container.querySelectorAll('input').forEach(function(i)
            {
                i.value = null
            })
        }
    }

    document.getElementById('add-new').addEventListener('click', function(e)
    {
        e.preventDefault()
        cont.appendChild(cont.children[0].cloneNode(true))
        cont.lastElementChild.querySelector('.remove-pair').addEventListener('click', remove)
        cont.lastElementChild.querySelectorAll('input').forEach(function(i,x)
        {
            i.value = null
            x||i.focus()
        })
    })

    document.querySelector('.remove-pair').addEventListener('click', remove)
    
    form.removeAttribute('onsubmit')
    form.addEventListener('submit', function(e)
    {
        e.preventDefault()

        var pairs = [], key, value

        if ( cont.childElementCount ) {
            for (var i=0; i<cont.childElementCount; i++) {
                key = cont.children[i].querySelector('input').value.trim()
                value = cont.children[i].querySelector('input + input').value.trim()
                key && value && pairs.push( [ key, value ] )
            }
        }

        message('Changes saved.') && chrome.storage.sync.set({pairs: pairs})
    })

    chrome.storage.sync.get('pairs', function(pairs)
    {
        pairs = pairs ? pairs.pairs : []
        if ( pairs ) {
            pairs.forEach(function(pair, i)
            {
                i && document.getElementById('add-new').click()
                cont.lastElementChild.querySelector('input').value = pair[0]
                cont.lastElementChild.querySelector('input + input').value = pair[1]
            })
            document.activeElement && document.activeElement.blur()
        }
    })

})()
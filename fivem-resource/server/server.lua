-- Simple NUI callback forwarder example
RegisterNUICallback('action', function(data, cb)
  local action = data.action
  local payload = data.payload
  -- Example: forward to backend via HTTP (adjust URL/port)
  PerformHttpRequest('http://127.0.0.1:3001/api/pre-applications', function(status, response, headers) end, 'POST', json.encode(payload), { ['Content-Type'] = 'application/json' })
  cb({ ok = true })
end)

-- Example server event to open UI for a player
RegisterCommand('coc_open', function(source, args, raw)
  local _source = source
  TriggerClientEvent('coc:openUI', _source)
end, false)

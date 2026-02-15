RegisterNetEvent('coc:openUI')
AddEventHandler('coc:openUI', function()
  SetNuiFocus(true, true)
  SendNUIMessage({ type = 'openPreApps' })
end)

-- Example NUI callback handler
RegisterNUICallback('close', function(data, cb)
  SetNuiFocus(false, false)
  cb('ok')
end)

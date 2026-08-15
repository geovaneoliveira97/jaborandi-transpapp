import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logQrScan } from './scan'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.unstubAllGlobals()
})

describe('logQrScan', () => {
  it('registra a leitura apenas uma vez por linha na mesma sessão', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    await logQrScan(1)
    await logQrScan(1)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('registra leituras separadas para linhas diferentes', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    await logQrScan(1)
    await logQrScan(2)

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('não marca como registrado quando a requisição falha, permitindo nova tentativa', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    vi.stubGlobal('fetch', fetchMock)

    await logQrScan(1)
    await logQrScan(1)

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('não lança erro quando o fetch rejeita (falha de rede)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network error'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(logQrScan(1)).resolves.toBeUndefined()
  })
})

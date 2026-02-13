#!/usr/bin/env python3
"""
Script para testar login direto na API (sem passar pelo frontend)

Uso:
    export ADMIN_USERNAME="seu_usuario"
    export ADMIN_PASSWORD="sua_senha"
    python3 test_login.py
"""
import requests
import json
import os

# Configurações
BASE_URL = "https://backgestao.pythonanywhere.com"
# Para API Admin (painel master)
ADMIN_API_BASE = f"{BASE_URL}/apidoc"
# Para API do Cliente (instâncias)
CLIENT_API_BASE = f"{BASE_URL}"

# Credenciais (use variáveis de ambiente para segurança)
# Uso: export ADMIN_USERNAME="seu_usuario" && export ADMIN_PASSWORD="sua_senha" && python3 test_login.py
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "[CONFIGURE_ADMIN_USERNAME]")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "[CONFIGURE_ADMIN_PASSWORD]")

def test_admin_login():
    """Testa login na API Admin"""
    url = f"{ADMIN_API_BASE}/auth/login"
    payload = {
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    }
    
    print(f"\n{'='*60}")
    print("TESTE: Login API Admin")
    print(f"{'='*60}")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print(f"\nFazendo requisição...")
    
    try:
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Status Text: {response.reason}")
        print(f"\nHeaders:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
        
        print(f"\nResponse Body:")
        try:
            print(json.dumps(response.json(), indent=2))
        except:
            print(response.text)
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Login bem-sucedido!")
            print(f"Token: {data.get('access_token', 'N/A')[:50]}...")
            print(f"Token Type: {data.get('token_type', 'N/A')}")
            return data.get('access_token')
        else:
            print(f"\n❌ Login falhou!")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Erro na requisição: {e}")
        return None

def test_client_login():
    """Testa login na API do Cliente"""
    url = f"{CLIENT_API_BASE}/auth/login"
    # API do cliente pode usar "senha" ao invés de "password"
    payload_password = {
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    }
    payload_senha = {
        "username": ADMIN_USERNAME,
        "senha": ADMIN_PASSWORD
    }
    
    print(f"\n{'='*60}")
    print("TESTE: Login API do Cliente (com 'password')")
    print(f"{'='*60}")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload_password, indent=2)}")
    print(f"\nFazendo requisição...")
    
    try:
        response = requests.post(
            url,
            json=payload_password,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Status Text: {response.reason}")
        
        if response.status_code != 200:
            print(f"\nTentando com 'senha' ao invés de 'password'...")
            response = requests.post(
                url,
                json=payload_senha,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            print(f"Status Code: {response.status_code}")
        
        print(f"\nResponse Body:")
        try:
            print(json.dumps(response.json(), indent=2))
        except:
            print(response.text)
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Login bem-sucedido!")
            return data.get('access_token')
        else:
            print(f"\n❌ Login falhou!")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Erro na requisição: {e}")
        return None

if __name__ == "__main__":
    print("\n" + "="*60)
    print("TESTE DE LOGIN DIRETO NA API")
    print("="*60)
    
    # Testa API Admin primeiro
    admin_token = test_admin_login()
    
    # Testa API do Cliente
    client_token = test_client_login()
    
    print(f"\n{'='*60}")
    print("RESUMO")
    print(f"{'='*60}")
    print(f"API Admin: {'✅ OK' if admin_token else '❌ FALHOU'}")
    print(f"API Cliente: {'✅ OK' if client_token else '❌ FALHOU'}")
    print()

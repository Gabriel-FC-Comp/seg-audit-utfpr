#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Módulo para Cálculo de Chaves Diffie-Hellman

Autores: Daniel S. G. da Costa, Gabriel F. Conte e Vitor L. Q. Batista

Este módulo fornece funções para calcular chaves públicas e secretas no 
algoritmo de troca de chaves Diffie-Hellman, garantindo um meio seguro de 
compartilhamento de segredos entre duas partes.

Funções:
--------
- calc_kpu_diff_helman(p: int, g: int, Kpr: int) -> int
    Calcula a chave pública de um participante.

- calc_secret_diff_helman(p: int, Kpr_a: int, Kpu_b: int) -> int
    Calcula a chave secreta compartilhada entre dois participantes.
"""

#=================================================================================
# Definindo as funções do algoritmo Diffie-Hellman
#=================================================================================

def calc_kpu_diff_helman(p: int, g: int, Kpr: int) -> int:
    """
    Calcula a chave pública no algoritmo Diffie-Hellman.

    Args:
        p (int): Um número primo usado como módulo.
        g (int): O gerador (base) do grupo cíclico.
        Kpr (int): A chave privada do participante.

    Returns:
        int: A chave pública calculada.
    """
    Kpu = (g ** Kpr) % p
    return Kpu


def calc_secret_diff_helman(p: int, Kpr_a: int, Kpu_b: int) -> int:
    """
    Calcula a chave secreta compartilhada no algoritmo Diffie-Hellman.

    Args:
        p (int): Um número primo usado como módulo.
        Kpr_a (int): A chave privada do participante atual.
        Kpu_b (int): A chave pública do outro participante.

    Returns:
        int: A chave secreta compartilhada calculada.
    """
    K = (Kpu_b ** Kpr_a) % p
    return K

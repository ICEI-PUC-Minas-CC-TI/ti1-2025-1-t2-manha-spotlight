document.addEventListener('DOMContentLoaded', function () {
    const usuarioStr = sessionStorage.getItem('usuarioLogado');
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

    const deleteBtn = document.getElementById('delete-account');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            const usuarioParaExcluir = JSON.parse(sessionStorage.getItem('usuarioLogado'));
            if (!usuarioParaExcluir) {
                if (typeof displayMessage === 'function') {
                    displayMessage('Nenhum usuário logado para excluir.', 'error');
                } else {
                    alert('Erro: Nenhum usuário logado para excluir.');
                }
                return;
            }

            Swal.fire({
                title: 'Tem certeza?',
                text: "Todos os seus dados serão perdidos permanentemente!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sim, excluir conta!',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await fetch(`http://localhost:3000/usuarios/${usuarioParaExcluir.id}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.ok) {
                            sessionStorage.removeItem('usuarioLogado');
                            await Swal.fire(
                                'Conta Excluída!',
                                'Sua conta foi removida com sucesso.',
                                'success'
                            );
                            window.location.href = 'index.html';
                        } else {
                            const errorData = await response.json().catch(() => ({}));
                            throw new Error(errorData.message || 'Erro ao excluir conta');
                        }
                    } catch (error) {
                        console.error('Erro ao excluir conta:', error);
                        Swal.fire(
                            'Erro!',
                            'Não foi possível excluir sua conta. Tente novamente mais tarde.',
                            'error'
                        );
                    }
                }
            });
        });
    }

    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('usuarioLogado');
            if (typeof displayMessage === 'function') {
                displayMessage('Você foi desconectado.', 'success');
            } else {
                alert('Você foi desconectado.');
            }
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
});
<?php
/**
 * Plugin Name: Currency Exchange Widget (CBR)
 * Description: A simple plugin to render a React app via a shortcode.
 */

// Инициализация базовых валют при активации плагина
function dbt_init_default_currencies() {
	if (get_option('dbt_custom_currencies') === false) {
		$default_currencies = [
			'RUB' => ['code' => 'RUB', 'flag' => '🇷🇺', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0],
			'USD' => ['code' => 'USD', 'flag' => '🇺🇸', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0],
			'THB' => ['code' => 'THB', 'flag' => '🇹🇭', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0],
			'EUR' => ['code' => 'EUR', 'flag' => '🇪🇺', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0],
			'AED' => ['code' => 'AED', 'flag' => '🇦🇪', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0],
			'USDT' => ['code' => 'USDT', 'flag' => '🪙', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 1],
		];
		update_option('dbt_custom_currencies', $default_currencies);
	}
}
register_activation_hook(__FILE__, 'dbt_init_default_currencies');
add_action('admin_init', 'dbt_init_default_currencies');

// Добавляем страницу в общую панель WordPress
function dbt_currency_admin_menu() {
	add_menu_page(
		'Управление валютами',
		'Валюты',
		'manage_options',
		'dbt-currency-settings',
		'dbt_currency_settings_page',
		'dashicons-money-alt',
		30
	);
}
add_action('admin_menu', 'dbt_currency_admin_menu');

// Страница настроек
function dbt_currency_settings_page() {
	if (!current_user_can('manage_options')) {
		return;
	}

	// Базовые валюты по умолчанию
	$default_currencies = [
		'RUB' => ['code' => 'RUB', 'flag' => '🇷🇺', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0, 'active' => 1],
		'USD' => ['code' => 'USD', 'flag' => '🇺🇸', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0, 'active' => 1],
		'THB' => ['code' => 'THB', 'flag' => '🇹🇭', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0, 'active' => 1],
		'EUR' => ['code' => 'EUR', 'flag' => '🇪🇺', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0, 'active' => 1],
		'AED' => ['code' => 'AED', 'flag' => '🇦🇪', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0, 'active' => 1],
		'USDT' => ['code' => 'USDT', 'flag' => '🪙', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 1, 'active' => 1],
	];

	// Обработка сохранения
	if (isset($_POST['dbt_save_currencies'])) {
		if (!isset($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'dbt_currency_settings')) {
			echo '<div class="notice notice-error is-dismissible"><p>Ошибка безопасности! Попробуйте еще раз.</p></div>';
		} else {
			// Получаем текущие валюты
			$current_currencies = get_option('dbt_custom_currencies', $default_currencies);
			$currencies = [];
			
			// Обрабатываем существующие валюты
			if (isset($_POST['currency_code']) && is_array($_POST['currency_code'])) {
				$codes = $_POST['currency_code'];
				$flags = $_POST['currency_flag'] ?? [];
				$icons = $_POST['currency_icon'] ?? [];
				$markups = $_POST['currency_markup'] ?? [];
				$cryptos = $_POST['currency_crypto'] ?? [];
				$actives = $_POST['currency_active'] ?? [];
				
				foreach ($codes as $index => $code_value) {
					$code_value = trim($code_value);
					if (!empty($code_value)) {
						$code = strtoupper(sanitize_text_field($code_value));
						$currencies[$code] = [
							'code' => $code,
							'flag' => sanitize_text_field($flags[$index] ?? ''),
							'icon' => sanitize_text_field($icons[$index] ?? ''),
							'payoutMarkup' => floatval($markups[$index] ?? 3.0),
							'isCrypto' => isset($cryptos[$index]) ? 1 : 0,
							'active' => isset($actives[$index]) ? 1 : 0,
						];
					}
				}
			}
			
			// Сохраняем URL кнопки обмена
			if (isset($_POST['exchange_button_url'])) {
				$exchange_url = esc_url_raw($_POST['exchange_button_url']);
				update_option('dbt_exchange_button_url', $exchange_url);
			}
			
			$result = update_option('dbt_custom_currencies', $currencies);
			
			$active_count = count(array_filter($currencies, function($c) { return !empty($c['active']); }));
			$total_count = count($currencies);
			
			echo '<div class="notice notice-success is-dismissible" data-clear-fields="true"><p>';
			echo "Настройки сохранены! Всего валют: {$total_count}, активных: {$active_count}";
			echo '</p></div>';
			
			// Обновляем список валют после сохранения
			$all_currencies = $currencies;
		}
	} else {
		// Первая загрузка - получаем валюты из БД
		$all_currencies = get_option('dbt_custom_currencies', $default_currencies);
	}
	
	// Получаем URL кнопки обмена
	$exchange_button_url = get_option('dbt_exchange_button_url', '');

	?>
	<div class="wrap">
		<h1>🏦 Управление валютами</h1>
		<p class="description">
			<strong>Управляйте всеми валютами в одной таблице.</strong> Используйте чекбокс "✓ Активна" для включения/выключения валют.<br>
			Базовые валюты (RUB, USD, THB, EUR, AED, USDT) отмечены синим цветом и не могут быть удалены.
		</p>
		
		<form method="post" action="<?php echo esc_url(admin_url('admin.php?page=dbt-currency-settings')); ?>" id="currencies-form">
			<?php wp_nonce_field('dbt_currency_settings'); ?>
			
			<table class="wp-list-table widefat fixed striped" style="margin-top: 20px;">
				<thead>
					<tr>
						<th style="width: 6%; text-align: center;">✓ Активна</th>
						<th style="width: 10%;">Код *</th>
						<th style="width: 10%;">Флаг</th>
						<th style="width: 32%;">Иконка (URL)</th>
						<th style="width: 10%;">Наценка %</th>
						<th style="width: 8%; text-align: center;">Крипто</th>
						<th style="width: 10%; text-align: center;">Тип</th>
						<th style="width: 8%; text-align: center;">Удалить</th>
					</tr>
				</thead>
				<tbody id="currencies-container">
					<?php 
					$index = 0;
					foreach ($all_currencies as $code => $currency): 
						$is_default = isset($default_currencies[$code]);
						$is_active = isset($currency['active']) ? $currency['active'] : 1;
					?>
					<tr class="currency-row" style="background: <?php echo $is_default ? '#f0f8ff' : '#fff'; ?>;">
						<td style="text-align: center;">
							<input type="checkbox" name="currency_active[]" value="<?php echo $index; ?>" <?php checked($is_active, 1); ?> />
						</td>
						<td>
							<input type="text" name="currency_code[]" value="<?php echo esc_attr($code); ?>" 
								   class="regular-text" required <?php echo $is_default ? 'readonly style="background: #f0f8ff;"' : ''; ?> />
						</td>
						<td>
							<input type="text" name="currency_flag[]" value="<?php echo esc_attr($currency['flag'] ?? ''); ?>" 
								   class="regular-text" placeholder="🪙" style="width: 60px;" />
						</td>
						<td>
							<input type="url" name="currency_icon[]" value="<?php echo esc_attr($currency['icon'] ?? ''); ?>" 
								   class="regular-text" placeholder="https://example.com/icon.png" />
						</td>
						<td>
							<input type="number" name="currency_markup[]" value="<?php echo esc_attr($currency['payoutMarkup'] ?? 3.0); ?>" 
								   step="0.1" class="small-text" style="width: 60px;" />
						</td>
						<td style="text-align: center;">
							<input type="checkbox" name="currency_crypto[]" value="<?php echo $index; ?>" 
								   <?php checked($currency['isCrypto'] ?? 0, 1); ?> />
						</td>
						<td style="text-align: center;">
							<?php if ($is_default): ?>
								<span style="color: #0073aa; font-weight: bold; font-size: 10px; padding: 2px 6px; background: #e5f5fa; border-radius: 3px;">БАЗА</span>
							<?php else: ?>
								<span style="color: #46b450; font-weight: bold; font-size: 10px; padding: 2px 6px; background: #ecf7ed; border-radius: 3px;">СВОЯ</span>
							<?php endif; ?>
						</td>
						<td style="text-align: center;">
							<?php if (!$is_default): ?>
								<button type="button" class="button button-small remove-currency-btn" 
										data-code="<?php echo esc_attr($code); ?>" title="Удалить валюту">✕</button>
							<?php else: ?>
								<span style="color: #ccc; font-size: 18px;">—</span>
							<?php endif; ?>
						</td>
					</tr>
					<?php 
					$index++;
					endforeach; 
					?>
				</tbody>
			</table>
			
			<p style="margin-top: 20px; padding: 15px; background: #fff9e6; border-left: 4px solid #ffb900;">
				<strong>💡 Совет:</strong> Используйте кнопку ниже для добавления новых валют. 
				Заполните код валюты (обязательно) и другие поля. Можно добавить сразу несколько валют.
			</p>
			
			<p style="margin-top: 15px;">
				<button type="button" id="add-currency-btn" class="button button-secondary button-large">
					<span class="dashicons dashicons-plus-alt" style="margin-top: 4px;"></span> Добавить валюту
				</button>
			</p>
			
			<hr style="margin: 30px 0; border: none; border-top: 2px solid #ddd;">

			<h2>🔗 Настройки кнопки обмена</h2>
			<table class="form-table">
				<tr>
					<th scope="row">
						<label for="exchange_button_url">URL для кнопки "Обменять"</label>
					</th>
					<td>
						<input type="url" 
							   name="exchange_button_url" 
							   id="exchange_button_url" 
							   value="<?php echo esc_attr($exchange_button_url); ?>" 
							   class="regular-text" 
							   placeholder="https://example.com/exchange"
						/>
						<p class="description">
							Введите полную ссылку, куда будет вести кнопка "Обменять". 
							Если оставить пустым, кнопка будет неактивной.
						</p>
					</td>
				</tr>
			</table>
			
			<?php submit_button('💾 Сохранить все изменения', 'primary large', 'dbt_save_currencies'); ?>
		</form>
	
	<div id="debug-info" style="margin-top: 20px; padding: 15px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px;">
		<strong style="font-size: 14px;">📋 Отладочная информация:</strong>
		<div id="debug-log" style="margin-top: 10px; padding: 10px; background: #fff; border: 1px solid #ddd; border-radius: 3px; max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 12px; line-height: 1.6;"></div>
	</div>
</div>
	
	<script>
	(function() {
		// Функция для отладочных логов
		function debugLog(message, data) {
			const debugDiv = document.getElementById('debug-log');
			if (!debugDiv) return;
			
			const time = new Date().toLocaleTimeString();
			const logEntry = document.createElement('div');
			logEntry.style.marginBottom = '5px';
			logEntry.style.paddingBottom = '5px';
			logEntry.style.borderBottom = '1px solid #eee';
			
			let logText = `[${time}] ${message}`;
			if (data !== undefined) {
				logText += '\n' + JSON.stringify(data, null, 2);
			}
			
			logEntry.textContent = logText;
			logEntry.style.whiteSpace = 'pre-wrap';
			debugDiv.appendChild(logEntry);
			debugDiv.scrollTop = debugDiv.scrollHeight;
		}
		
		debugLog('🚀 Скрипт инициализирован (единая таблица с активацией)');
		
		function createNewRow() {
			const container = document.getElementById('currencies-container');
			if (!container) return null;
			
			const currentIndex = container.querySelectorAll('.currency-row').length;
			const tr = document.createElement('tr');
			tr.className = 'currency-row new-currency-row';
			tr.style.background = '#fff';
			
			tr.innerHTML = `
				<td style="text-align: center;">
					<input type="checkbox" name="currency_active[]" value="${currentIndex}" checked />
				</td>
				<td>
					<input type="text" name="currency_code[]" class="regular-text" placeholder="USD" required />
				</td>
				<td>
					<input type="text" name="currency_flag[]" class="regular-text" placeholder="🪙" style="width: 60px;" />
				</td>
				<td>
					<input type="url" name="currency_icon[]" class="regular-text" placeholder="https://..." />
				</td>
				<td>
					<input type="number" name="currency_markup[]" value="3.0" step="0.1" class="small-text" style="width: 60px;" />
				</td>
				<td style="text-align: center;">
					<input type="checkbox" name="currency_crypto[]" value="${currentIndex}" />
				</td>
				<td style="text-align: center;">
					<span style="color: #46b450; font-weight: bold; font-size: 10px; padding: 2px 6px; background: #ecf7ed; border-radius: 3px;">НОВАЯ</span>
				</td>
				<td style="text-align: center;">
					<button type="button" class="button button-small remove-currency-btn" title="Удалить">✕</button>
				</td>
			`;
			
			return tr;
		}
		
		function updateAllIndexes() {
			const container = document.getElementById('currencies-container');
			if (!container) return;
			
			const rows = container.querySelectorAll('.currency-row');
			debugLog(`🔢 Обновление индексов (всего строк: ${rows.length})`);
			
			rows.forEach((row, index) => {
				// Обновляем индексы чекбоксов
				const activeCheckbox = row.querySelector('input[name="currency_active[]"]');
				const cryptoCheckbox = row.querySelector('input[name="currency_crypto[]"]');
				
				if (activeCheckbox) activeCheckbox.value = index;
				if (cryptoCheckbox) cryptoCheckbox.value = index;
			});
		}
		
		
		document.addEventListener('DOMContentLoaded', function() {
			debugLog('📄 DOM загружен, единая таблица');
			
			const addBtn = document.getElementById('add-currency-btn');
			const container = document.getElementById('currencies-container');
			const form = document.getElementById('currencies-form');
			
			debugLog('🔍 Проверка элементов:', {
				addBtn: !!addBtn,
				container: !!container,
				form: !!form
			});
			
			// Обработчик добавления валюты
			if (addBtn && container) {
				debugLog('✅ Обработчик добавления установлен');
				
				addBtn.addEventListener('click', function(e) {
					e.preventDefault();
					debugLog('➕ Добавление новой валюты');
					
					const newRow = createNewRow();
					if (newRow) {
						container.appendChild(newRow);
						updateAllIndexes();
						
						const totalRows = container.querySelectorAll('.currency-row').length;
						debugLog(`✅ Валюта добавлена. Всего валют: ${totalRows}`);
					} else {
						debugLog('⚠️ Ошибка создания новой строки');
					}
				});
			}
			
			// Обработчик удаления валюты (делегирование событий)
			if (container) {
				container.addEventListener('click', function(e) {
					if (e.target.classList.contains('remove-currency-btn')) {
						e.preventDefault();
						const code = e.target.getAttribute('data-code') || 'новая';
						debugLog(`🗑️ Удаление валюты: ${code}`);
						
						if (confirm(`Удалить валюту ${code}?`)) {
							const row = e.target.closest('.currency-row');
							if (row) {
								row.remove();
								updateAllIndexes();
								
								const totalRows = container.querySelectorAll('.currency-row').length;
								debugLog(`✅ Валюта удалена. Осталось: ${totalRows}`);
							}
						}
					}
				});
			}
			
			// Обработчик отправки формы
			if (form) {
				debugLog('✅ Обработчик формы установлен');
				
				form.addEventListener('submit', function(e) {
					debugLog('📤 Отправка формы');
					
					// Собираем данные всех валют
					const codes = Array.from(document.querySelectorAll('input[name="currency_code[]"]')).map(i => i.value);
					const actives = Array.from(document.querySelectorAll('input[name="currency_active[]"]:checked')).map(i => parseInt(i.value));
					const cryptos = Array.from(document.querySelectorAll('input[name="currency_crypto[]"]:checked')).map(i => parseInt(i.value));
					
					const allCurrencies = codes.map((code, index) => ({
						index,
						code,
						active: actives.includes(index),
						crypto: cryptos.includes(index)
					})).filter(c => c.code.trim() !== '');
					
					const activeCount = allCurrencies.filter(c => c.active).length;
					
					debugLog('📋 Отправляемые данные:', {
						total: allCurrencies.length,
						active: activeCount,
						currencies: allCurrencies
					});
					
					debugLog(`✅ Отправка ${allCurrencies.length} валют (активных: ${activeCount})`);
				});
			}
			
			debugLog('✅ Инициализация завершена');
		});
	})();
	</script>
	<?php
}

function dbt_render_react_wp_shortcode_app($atts) {

	$idPrefix = "dbt-react-wp-shortcode-app";
	$randomNum = rand(0, 100);

	$atts = shortcode_atts(
		[
			'id' => $randomNum, // Default ID if none is provided
		],
		$atts,
		'react_wp_shortcode_app'
	);

	$escapedID = esc_attr($atts['id']);
	$containerID = $idPrefix . '-' . $escapedID;

	wp_enqueue_script("dbt-react-wp-shortcode-app-$escapedID", plugins_url('/build/index.js', __FILE__), array('wp-element'), time(), true);
	wp_enqueue_style('dbt-react-wp-shortcode-app-style', plugins_url('/build/style-index.css', __FILE__), array(), time());

	// Получаем все валюты из админки (включая базовые)
	$all_currencies = get_option('dbt_custom_currencies', []);
	
	// Если валюты не инициализированы, используем базовые
	if (empty($all_currencies)) {
		$all_currencies = [
			'RUB' => ['code' => 'RUB', 'flag' => '🇷🇺', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0],
			'USD' => ['code' => 'USD', 'flag' => '🇺🇸', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0],
			'THB' => ['code' => 'THB', 'flag' => '🇹🇭', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0],
			'EUR' => ['code' => 'EUR', 'flag' => '🇪🇺', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0],
			'AED' => ['code' => 'AED', 'flag' => '🇦🇪', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 0],
			'USDT' => ['code' => 'USDT', 'flag' => '🪙', 'icon' => '', 'payoutMarkup' => 3.0, 'isCrypto' => 1],
		];
	}
	
	$data_to_pass_to_js = [
		'containerID' => $containerID,
		'customCurrencies' => $all_currencies,
		'exchangeButtonUrl' => get_option('dbt_exchange_button_url', ''),
	];

	wp_localize_script("dbt-react-wp-shortcode-app-$escapedID", 'pluginData', $data_to_pass_to_js);

	return '<div id="' . $containerID . '"></div>';
}

add_shortcode('react_wp_shortcode_app', 'dbt_render_react_wp_shortcode_app');
